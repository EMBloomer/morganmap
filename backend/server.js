import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MorganMap Backend API'
  });
});

// ============================================================================
// ENDPOINT 1: Fetch URL Content (CORS Proxy)
// ============================================================================
app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        error: 'Only HTTP and HTTPS protocols are allowed'
      });
    }

    console.log(`Fetching URL: ${url}`);

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MorganMap Theatre Tour Mapping App (https://github.com/yourusername/morganmap)',
      },
      timeout: 30000, // 30 second timeout
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch URL: ${response.statusText}`
      });
    }

    const contentType = response.headers.get('content-type');

    // Only allow HTML/text content
    if (!contentType || !contentType.includes('text/html')) {
      return res.status(400).json({
        success: false,
        error: 'URL must return HTML content'
      });
    }

    const htmlContent = await response.text();

    res.json({
      success: true,
      content: htmlContent,
      url: url,
      contentType: contentType
    });

  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch URL'
    });
  }
});

// ============================================================================
// ENDPOINT 2: Extract Tour with AI
// ============================================================================
app.post('/api/extract-tour', async (req, res) => {
  try {
    const { htmlContent, url, provider } = req.body;

    if (!htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required'
      });
    }

    // Determine which AI provider to use
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openaiKey && !anthropicKey) {
      return res.status(500).json({
        success: false,
        error: 'No AI API key configured. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to backend .env file'
      });
    }

    // Use provider preference or default to available key
    const useProvider = provider || (openaiKey ? 'openai' : 'anthropic');

    console.log(`Extracting tour data using ${useProvider} for URL: ${url}`);

    // Build the prompt
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

    let extractedText;

    if (useProvider === 'openai' && openaiKey) {
      extractedText = await callOpenAI(prompt, openaiKey);
    } else if (useProvider === 'anthropic' && anthropicKey) {
      extractedText = await callAnthropic(prompt, anthropicKey);
    } else {
      return res.status(400).json({
        success: false,
        error: `Provider ${useProvider} not available or API key not configured`
      });
    }

    // Parse and process the response
    const tourData = parseTourResponse(extractedText);

    res.json({
      success: true,
      data: tourData,
      provider: useProvider
    });

  } catch (error) {
    console.error('Error extracting tour:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract tour data'
    });
  }
});

// ============================================================================
// ENDPOINT 3: Geocode Address
// ============================================================================
app.post('/api/geocode', async (req, res) => {
  try {
    const { address, provider } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    // Default to Nominatim (free service)
    const useProvider = provider || 'nominatim';

    console.log(`Geocoding address using ${useProvider}: ${address}`);

    let result;

    switch (useProvider) {
      case 'nominatim':
        result = await geocodeWithNominatim(address);
        break;
      case 'opencage':
        if (!process.env.OPENCAGE_API_KEY) {
          return res.status(400).json({
            success: false,
            error: 'OpenCage API key not configured'
          });
        }
        result = await geocodeWithOpenCage(address, process.env.OPENCAGE_API_KEY);
        break;
      case 'google':
        if (!process.env.GOOGLE_MAPS_API_KEY) {
          return res.status(400).json({
            success: false,
            error: 'Google Maps API key not configured'
          });
        }
        result = await geocodeWithGoogle(address, process.env.GOOGLE_MAPS_API_KEY);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid geocoding provider'
        });
    }

    res.json(result);

  } catch (error) {
    console.error('Error geocoding:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Geocoding failed'
    });
  }
});

// ============================================================================
// AI Helper Functions
// ============================================================================

async function callOpenAI(prompt, apiKey) {
  const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt, apiKey) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Anthropic API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function parseTourResponse(response) {
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
      parsed.venues = parsed.venues.map((venue, index) => {
        const startDate = new Date(venue.startDate);
        const endDate = new Date(venue.endDate);
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

// ============================================================================
// Geocoding Helper Functions
// ============================================================================

async function geocodeWithNominatim(address) {
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
    provider: 'nominatim',
  };
}

async function geocodeWithOpenCage(address, apiKey) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&limit=1`;

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
    provider: 'opencage',
  };
}

async function geocodeWithGoogle(address, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

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
    provider: 'google',
  };
}

// ============================================================================
// Error Handler
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🗺️  MorganMap Backend API Server                        ║
║                                                           ║
║  Status: Running                                          ║
║  Port: ${PORT}                                           ║
║  Time: ${new Date().toLocaleString()}                    ║
║                                                           ║
║  Endpoints:                                               ║
║  • GET  /health                                           ║
║  • POST /api/fetch-url                                    ║
║  • POST /api/extract-tour                                 ║
║  • POST /api/geocode                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Check for API keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenCage = !!process.env.OPENCAGE_API_KEY;
  const hasGoogleMaps = !!process.env.GOOGLE_MAPS_API_KEY;

  console.log('\nAPI Keys Status:');
  console.log(`  OpenAI:       ${hasOpenAI ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Anthropic:    ${hasAnthropic ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  OpenCage:     ${hasOpenCage ? '✓ Configured' : '✗ Not configured (optional)'}`);
  console.log(`  Google Maps:  ${hasGoogleMaps ? '✓ Configured' : '✗ Not configured (optional)'}`);

  if (!hasOpenAI && !hasAnthropic) {
    console.log('\n⚠️  WARNING: No AI API key configured!');
    console.log('   Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to your .env file');
  }

  console.log('\n🚀 Server ready to handle requests!\n');
});
