import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AIService } from '../src/services/ai';
import type { AIExtractionResponse } from '../src/types/tour';

/**
 * Serverless API endpoint for extracting tour data from a webpage URL
 *
 * @route POST /api/extract-tour
 * @body { url: string, provider: 'openai' | 'anthropic', apiKey: string }
 * @returns AIExtractionResponse
 *
 * Rate Limiting Considerations:
 * - Consider implementing rate limiting based on IP address or API key
 * - Vercel Edge Config or KV storage can be used for tracking request counts
 * - Recommended limits: 10 requests per minute per IP, 100 requests per hour
 * - For production, consider using Vercel's rate limiting middleware
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // In production, replace with specific origin
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    const response: AIExtractionResponse = {
      success: false,
      error: 'Method not allowed. This endpoint only accepts POST requests.',
    };
    res.status(405).json(response);
    return;
  }

  try {
    // Parse and validate request body
    const { url, provider, apiKey } = req.body;

    // Validate required parameters
    if (!url || typeof url !== 'string') {
      const response: AIExtractionResponse = {
        success: false,
        error: 'Missing or invalid "url" parameter. Please provide a valid URL string.',
      };
      res.status(400).json(response);
      return;
    }

    if (!provider || !['openai', 'anthropic'].includes(provider)) {
      const response: AIExtractionResponse = {
        success: false,
        error: 'Missing or invalid "provider" parameter. Must be either "openai" or "anthropic".',
      };
      res.status(400).json(response);
      return;
    }

    if (!apiKey || typeof apiKey !== 'string') {
      const response: AIExtractionResponse = {
        success: false,
        error: 'Missing or invalid "apiKey" parameter. Please provide a valid API key string.',
      };
      res.status(400).json(response);
      return;
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (urlError) {
      const response: AIExtractionResponse = {
        success: false,
        error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.',
      };
      res.status(400).json(response);
      return;
    }

    // Fetch webpage content
    let htmlContent: string;
    try {
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'MorganMap Tour Extractor Bot/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        // Set reasonable timeout (30 seconds)
        signal: AbortSignal.timeout(30000),
      });

      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch webpage: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }

      const contentType = fetchResponse.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        throw new Error('URL does not point to an HTML webpage');
      }

      htmlContent = await fetchResponse.text();

      if (!htmlContent || htmlContent.length === 0) {
        throw new Error('Webpage returned empty content');
      }
    } catch (fetchError: any) {
      let errorMessage = 'Failed to fetch webpage content.';

      if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
        errorMessage = 'Request timed out while fetching the webpage. The URL may be slow to respond.';
      } else if (fetchError instanceof TypeError) {
        errorMessage = 'Network error while fetching the webpage. Please check the URL and try again.';
      } else if (fetchError.message) {
        errorMessage = `Failed to fetch webpage: ${fetchError.message}`;
      }

      const response: AIExtractionResponse = {
        success: false,
        error: errorMessage,
      };
      res.status(502).json(response); // Bad Gateway - external service error
      return;
    }

    // Initialize AI service and extract tour data
    try {
      const aiService = new AIService({
        provider: provider as 'openai' | 'anthropic',
        apiKey,
      });

      const tourData = await aiService.extractTourData(htmlContent, url);

      // Validate that we got some meaningful data
      if (!tourData || typeof tourData !== 'object') {
        throw new Error('AI service returned invalid data format');
      }

      const response: AIExtractionResponse = {
        success: true,
        tour: tourData,
      };

      res.status(200).json(response);
    } catch (aiError: any) {
      let errorMessage = 'Failed to extract tour data using AI.';

      if (aiError.message) {
        // Check for common AI API errors
        if (aiError.message.includes('API error')) {
          errorMessage = `AI service error: ${aiError.message}. Please check your API key and try again.`;
        } else if (aiError.message.includes('parse')) {
          errorMessage = 'Failed to parse the extracted tour data. The webpage may not contain valid tour information.';
        } else {
          errorMessage = `AI extraction failed: ${aiError.message}`;
        }
      }

      const response: AIExtractionResponse = {
        success: false,
        error: errorMessage,
      };
      res.status(500).json(response);
      return;
    }
  } catch (error: any) {
    // Catch-all error handler for unexpected errors
    console.error('Unexpected error in extract-tour endpoint:', error);

    const response: AIExtractionResponse = {
      success: false,
      error: error.message || 'An unexpected error occurred while processing your request.',
    };
    res.status(500).json(response);
  }
}
