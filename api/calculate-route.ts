import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DistanceService } from '../src/services/distance';
import { Venue, Route } from '../src/types/tour';

/**
 * Serverless API endpoint for calculating routes between theatre venues
 *
 * POST /api/calculate-route
 * Body: { venues: Venue[] }
 *
 * Returns calculated routes and total distance
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const { venues } = req.body;

    // Validate venues parameter exists
    if (!venues) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: venues',
      });
    }

    // Validate venues is an array
    if (!Array.isArray(venues)) {
      return res.status(400).json({
        success: false,
        error: 'Venues must be an array',
      });
    }

    // Validate venues array is not empty
    if (venues.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Venues array cannot be empty',
      });
    }

    // Validate venues array has at least 2 venues for route calculation
    if (venues.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 venues are required to calculate routes',
      });
    }

    // Validate each venue has valid latitude and longitude
    for (let i = 0; i < venues.length; i++) {
      const venue = venues[i];

      if (!venue) {
        return res.status(400).json({
          success: false,
          error: `Venue at index ${i} is null or undefined`,
        });
      }

      if (typeof venue.latitude !== 'number' || isNaN(venue.latitude)) {
        return res.status(400).json({
          success: false,
          error: `Venue at index ${i} (${venue.name || 'unnamed'}) has invalid latitude`,
        });
      }

      if (typeof venue.longitude !== 'number' || isNaN(venue.longitude)) {
        return res.status(400).json({
          success: false,
          error: `Venue at index ${i} (${venue.name || 'unnamed'}) has invalid longitude`,
        });
      }

      // Validate latitude range (-90 to 90)
      if (venue.latitude < -90 || venue.latitude > 90) {
        return res.status(400).json({
          success: false,
          error: `Venue at index ${i} (${venue.name || 'unnamed'}) has latitude out of valid range (-90 to 90)`,
        });
      }

      // Validate longitude range (-180 to 180)
      if (venue.longitude < -180 || venue.longitude > 180) {
        return res.status(400).json({
          success: false,
          error: `Venue at index ${i} (${venue.name || 'unnamed'}) has longitude out of valid range (-180 to 180)`,
        });
      }
    }

    // Calculate routes between consecutive venues
    const routes: Route[] = DistanceService.calculateRoutes(venues);

    // Calculate total distance
    const totalDistance = DistanceService.calculateTotalDistance(routes);

    // Return successful response
    return res.status(200).json({
      success: true,
      routes,
      totalDistance,
    });

  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error('Error calculating routes:', error);

    // Return error response
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while calculating routes',
    });
  }
}
