import { GeocodeResponse } from '../types/tour';
import { config } from '../config';

/**
 * GeocodingService - Client for backend geocoding operations
 *
 * This service communicates with the backend API for geocoding addresses,
 * keeping API keys secure on the server side and handling rate limiting.
 */
export class GeocodingService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = config.backendUrl;
  }

  /**
   * Geocodes an address via the backend API
   *
   * @param address - The address to geocode
   * @returns GeocodeResponse with coordinates or error
   */
  async geocode(address: string): Promise<GeocodeResponse> {
    try {
      const response = await fetch(`${this.backendUrl}/api/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        return {
          success: false,
          error: errorData.error || 'Geocoding request failed',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Geocoding failed',
      };
    }
  }

  /**
   * Helper to add delay for rate limiting
   * @param ms - Milliseconds to delay
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
