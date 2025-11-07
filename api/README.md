# MorganMap API Endpoints

This directory contains serverless API functions for the MorganMap theatre tour mapping application. These endpoints are designed to be deployed to Vercel's serverless platform.

## Endpoints

### 1. Extract Tour (`/api/extract-tour`)

Extracts tour data from a webpage URL using AI.

**Method:** `POST`

**Request Body:**
```json
{
  "url": "https://example.com/tour-announcement",
  "provider": "openai",
  "apiKey": "your-api-key"
}
```

**Parameters:**
- `url` (string, required): The URL of the webpage containing tour information
- `provider` (string, required): AI provider to use - either `"openai"` or `"anthropic"`
- `apiKey` (string, required): Your API key for the selected AI provider

**Response:**
```json
{
  "success": true,
  "tour": {
    "name": "Tour Name",
    "description": "Tour description",
    "venues": [
      {
        "id": "venue-0",
        "name": "Venue Name",
        "address": "Full address",
        "city": "City",
        "state": "State",
        "country": "Country",
        "startDate": "2024-01-15",
        "endDate": "2024-01-20",
        "durationDays": 5,
        "latitude": 0,
        "longitude": 0
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### 2. Geocode Venue (`/api/geocode-venue`)

Geocodes venue addresses to latitude/longitude coordinates with optional AI enhancement.

**Method:** `POST`

**Request Body:**
```json
{
  "venueName": "Broadway Theatre",
  "address": "1681 Broadway, New York, NY 10019",
  "geocodingProvider": "nominatim",
  "geocodingApiKey": "optional-api-key",
  "aiProvider": "anthropic",
  "aiApiKey": "optional-ai-key-for-normalization"
}
```

**Parameters:**
- `venueName` (string, required): The name of the venue
- `address` (string, required): The address to geocode
- `geocodingProvider` (string, optional): Geocoding service - `"nominatim"` (default), `"opencage"`, or `"google"`
- `geocodingApiKey` (string, optional): API key for the geocoding provider (required for OpenCage and Google)
- `aiProvider` (string, optional): AI provider for venue name normalization - `"openai"` or `"anthropic"`
- `aiApiKey` (string, optional): API key for AI normalization

**Response:**
```json
{
  "success": true,
  "latitude": 40.7614,
  "longitude": -73.9845,
  "formattedAddress": "Broadway Theatre, 1681 Broadway, New York, NY 10019, USA"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### 3. Calculate Route (`/api/calculate-route`)

Calculates distances and routes between consecutive venues.

**Method:** `POST`

**Request Body:**
```json
{
  "venues": [
    {
      "id": "venue-1",
      "name": "Theatre A",
      "latitude": 40.7614,
      "longitude": -73.9845,
      ...
    },
    {
      "id": "venue-2",
      "name": "Theatre B",
      "latitude": 51.5074,
      "longitude": -0.1278,
      ...
    }
  ]
}
```

**Parameters:**
- `venues` (array, required): Array of venue objects with valid latitude and longitude coordinates

**Response:**
```json
{
  "success": true,
  "routes": [
    {
      "from": { /* Venue object */ },
      "to": { /* Venue object */ },
      "distanceKm": 5574.8,
      "distanceMiles": 3463.4
    }
  ],
  "totalDistance": {
    "km": 5574.8,
    "miles": 3463.4
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `405` - Method Not Allowed (non-POST request)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error
- `502` - Bad Gateway (external service error)

## CORS

All endpoints include CORS headers to allow cross-origin requests. For production deployment, update the `Access-Control-Allow-Origin` header to match your frontend domain.

## Rate Limiting

Consider implementing rate limiting for production use:
- Recommended: 10 requests per minute per IP
- Use Vercel KV or Edge Config for tracking

## Deployment

These functions are designed for Vercel's serverless platform. They can also be adapted for other serverless providers (Netlify, AWS Lambda, etc.) with minimal modifications.

### Environment Variables

No environment variables are required for the API endpoints themselves, as API keys are passed in request bodies. However, for enhanced security in production, consider:

1. Using environment variables for default API keys
2. Implementing API key validation/management
3. Setting up rate limiting with Vercel KV

## Local Development

To test these endpoints locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run dev server
vercel dev

# Test endpoints
curl -X POST http://localhost:3000/api/extract-tour \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","provider":"openai","apiKey":"your-key"}'
```

## Dependencies

- `@vercel/node` - Vercel serverless function types (dev dependency)
- Core services from `../src/services/`:
  - `AIService` - AI provider wrapper
  - `GeocodingService` - Multi-provider geocoding
  - `DistanceService` - Distance calculations

## Security Considerations

1. **API Key Handling**: API keys are passed in request bodies. For production, consider server-side key management.
2. **Rate Limiting**: Implement rate limiting to prevent abuse.
3. **Input Validation**: All inputs are validated, but additional sanitization may be needed for production.
4. **CORS**: Update CORS settings for production to restrict origins.
5. **Timeout**: All endpoints have reasonable timeouts to prevent long-running requests.

## Performance

- Extract Tour: ~3-10 seconds (depends on AI provider)
- Geocode Venue: ~0.5-2 seconds (depends on provider and rate limiting)
- Calculate Route: <100ms (client-side calculations)

## Support

For issues or questions about the API endpoints, see the main [README.md](../README.md) or open a GitHub issue.
