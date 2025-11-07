import { Tour } from '../types/tour';
import { config } from '../config';

/**
 * AIService - Client for backend AI operations
 *
 * This service communicates with the backend API for AI-powered tour extraction,
 * keeping API keys secure on the server side.
 */
export class AIService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = config.backendUrl;
  }

  /**
   * Extracts tour data from HTML content via backend API
   *
   * @param htmlContent - The HTML content to extract from
   * @param url - The source URL of the content
   * @returns Partial tour data with venues
   * @throws Error if extraction fails or backend is unavailable
   */
  async extractTourData(htmlContent: string, url: string): Promise<Partial<Tour>> {
    try {
      const response = await fetch(`${this.backendUrl}/api/extract-tour`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlContent,
          url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || 'Failed to extract tour data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Provide helpful error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Cannot connect to backend server. Make sure the backend is running on ' + this.backendUrl);
        }
        throw error;
      }
      throw new Error('Failed to extract tour data from backend');
    }
  }
}
