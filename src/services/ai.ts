import { Tour, Venue } from '../types/tour';

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async extractTourData(htmlContent: string, url: string): Promise<Partial<Tour>> {
    const prompt = `Extract tour information from the following webpage content.

URL: ${url}

Content:
${htmlContent.substring(0, 10000)}

Please extract and return a JSON object with the following structure:
{
  "name": "Tour name",
  "description": "Brief description",
  "venues": [
    {
      "name": "Venue name",
      "address": "Full address if available, or city/state",
      "city": "City name",
      "state": "State/Province (if applicable)",
      "country": "Country",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  ]
}

Important: Return ONLY valid JSON, no markdown formatting or explanations.`;

    const response = await this.callLLM(prompt);
    return this.parseTourResponse(response);
  }

  async normalizeVenueName(venueName: string, context?: string): Promise<string> {
    const prompt = `Normalize this venue name to a full, formal name suitable for geocoding:

Venue: ${venueName}
${context ? `Context: ${context}` : ''}

Return ONLY the normalized venue name with full address if you can infer it, nothing else.
Example: "Winter Garden" -> "Winter Garden Theatre, 1634 Broadway, New York, NY"`;

    return await this.callLLM(prompt);
  }

  private async callLLM(prompt: string): Promise<string> {
    if (this.config.provider === 'openai') {
      return this.callOpenAI(prompt);
    } else if (this.config.provider === 'anthropic') {
      return this.callAnthropic(prompt);
    }
    throw new Error('Invalid AI provider');
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private parseTourResponse(response: string): Partial<Tour> {
    try {
      // Remove markdown code blocks if present
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
      }
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }

      const parsed = JSON.parse(cleaned.trim());

      // Add IDs and calculate durations
      if (parsed.venues) {
        parsed.venues = parsed.venues.map((venue: Partial<Venue>, index: number) => {
          const startDate = new Date(venue.startDate!);
          const endDate = new Date(venue.endDate!);
          const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

          return {
            ...venue,
            id: `venue-${index}`,
            durationDays,
            latitude: 0, // Will be filled by geocoding
            longitude: 0,
          };
        });
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse tour data from AI response');
    }
  }
}
