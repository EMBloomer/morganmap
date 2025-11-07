import { GeocodeResponse } from '../types/tour';

export class GeocodingService {
  private apiKey?: string;
  private provider: 'nominatim' | 'opencage' | 'google';

  constructor(provider: 'nominatim' | 'opencage' | 'google' = 'nominatim', apiKey?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  async geocode(address: string): Promise<GeocodeResponse> {
    try {
      switch (this.provider) {
        case 'nominatim':
          return await this.geocodeWithNominatim(address);
        case 'opencage':
          return await this.geocodeWithOpenCage(address);
        case 'google':
          return await this.geocodeWithGoogle(address);
        default:
          throw new Error('Invalid geocoding provider');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Geocoding failed',
      };
    }
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodeResponse> {
    // Nominatim is free but has rate limits (1 request per second)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MorganMap Theatre Tour Mapping App',
      },
    });

    if (!response.ok) {
      throw new Error('Nominatim API request failed');
    }

    const data = await response.json();

    if (data.length === 0) {
      return {
        success: false,
        error: 'No results found',
      };
    }

    return {
      success: true,
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name,
    };
  }

  private async geocodeWithOpenCage(address: string): Promise<GeocodeResponse> {
    if (!this.apiKey) {
      throw new Error('OpenCage API key required');
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${this.apiKey}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('OpenCage API request failed');
    }

    const data = await response.json();

    if (data.results.length === 0) {
      return {
        success: false,
        error: 'No results found',
      };
    }

    const result = data.results[0];

    return {
      success: true,
      latitude: result.geometry.lat,
      longitude: result.geometry.lng,
      formattedAddress: result.formatted,
    };
  }

  private async geocodeWithGoogle(address: string): Promise<GeocodeResponse> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key required');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Google Maps API request failed');
    }

    const data = await response.json();

    if (data.status !== 'OK' || data.results.length === 0) {
      return {
        success: false,
        error: data.status === 'ZERO_RESULTS' ? 'No results found' : data.status,
      };
    }

    const result = data.results[0];

    return {
      success: true,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  }

  // Helper to add delay for rate limiting (especially for Nominatim)
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
