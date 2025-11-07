import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GeocodingService } from '../src/services/geocoding';
import { AIService } from '../src/services/ai';
import { GeocodeResponse } from '../src/types/tour';

interface GeocodeVenueRequest {
  venueName: string;
  address: string;
  geocodingProvider?: 'nominatim' | 'opencage' | 'google';
  geocodingApiKey?: string;
  aiProvider?: 'openai' | 'anthropic';
  aiApiKey?: string;
}

/**
 * Serverless function to geocode venue addresses with optional AI enhancement
 *
 * POST /api/geocode-venue
 * Body: { venueName, address, geocodingProvider?, geocodingApiKey?, aiProvider?, aiApiKey? }
 *
 * Returns geocoded coordinates and formatted address
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
    return;
  }

  try {
    // Parse and validate request body
    const body: GeocodeVenueRequest = req.body;

    if (!body.venueName || typeof body.venueName !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid venueName parameter',
      });
      return;
    }

    if (!body.address || typeof body.address !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid address parameter',
      });
      return;
    }

    // Validate geocoding provider if provided
    const geocodingProvider = body.geocodingProvider || 'nominatim';
    if (!['nominatim', 'opencage', 'google'].includes(geocodingProvider)) {
      res.status(400).json({
        success: false,
        error: 'Invalid geocodingProvider. Must be nominatim, opencage, or google.',
      });
      return;
    }

    // Validate AI provider if provided
    if (body.aiProvider && !['openai', 'anthropic'].includes(body.aiProvider)) {
      res.status(400).json({
        success: false,
        error: 'Invalid aiProvider. Must be openai or anthropic.',
      });
      return;
    }

    let addressToGeocode = body.address;

    // Optional AI enhancement: normalize venue name if AI credentials provided
    if (body.aiProvider && body.aiApiKey) {
      try {
        const aiService = new AIService({
          provider: body.aiProvider,
          apiKey: body.aiApiKey,
        });

        const normalizedName = await aiService.normalizeVenueName(
          body.venueName,
          body.address
        );

        // Use the normalized name/address for geocoding if it looks valid
        if (normalizedName && normalizedName.trim().length > 0) {
          addressToGeocode = normalizedName.trim();
          console.log(`AI normalized venue: "${body.venueName}" -> "${addressToGeocode}"`);
        }
      } catch (aiError) {
        // AI normalization failure should not block geocoding
        // Log the error but continue with original address
        console.warn('AI normalization failed:', aiError);
        // Continue with original address
      }
    }

    // Add rate limiting delay for Nominatim (1 request per second)
    if (geocodingProvider === 'nominatim') {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Geocode the address
    const geocodingService = new GeocodingService(
      geocodingProvider,
      body.geocodingApiKey
    );

    const result: GeocodeResponse = await geocodingService.geocode(addressToGeocode);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error || 'Geocoding failed',
      });
      return;
    }

    // Return successful geocode result
    res.status(200).json({
      success: true,
      latitude: result.latitude,
      longitude: result.longitude,
      formattedAddress: result.formattedAddress,
    });

  } catch (error) {
    console.error('Geocode venue error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Rate limiting errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        });
        return;
      }

      // API key errors
      if (error.message.includes('API key') || error.message.includes('unauthorized')) {
        res.status(401).json({
          success: false,
          error: 'Invalid or missing API key for the selected provider.',
        });
        return;
      }

      // Network/timeout errors
      if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
        return;
      }

      // Generic error with message
      res.status(500).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // Unknown error
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while geocoding the venue.',
    });
  }
}
