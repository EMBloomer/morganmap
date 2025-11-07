# MorganMap Backend API

Backend server for MorganMap that handles CORS proxying and secure API key management for AI and geocoding services.

## Features

- **CORS Proxy**: Fetches webpage content from any URL without CORS restrictions
- **Secure AI Integration**: Keeps API keys server-side for OpenAI and Anthropic
- **Geocoding Proxy**: Supports multiple geocoding providers (Nominatim, OpenCage, Google Maps)
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Comprehensive error handling and validation

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your API keys in `.env`:
```env
PORT=3001

# At least one AI provider is required
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Geocoding (optional - defaults to free Nominatim)
OPENCAGE_API_KEY=your_opencage_api_key_here
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3001 (or the port specified in your `.env` file).

## API Endpoints

### Health Check
```
GET /health
```

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T10:30:00.000Z",
  "service": "MorganMap Backend API"
}
```

---

### Fetch URL Content (CORS Proxy)
```
POST /api/fetch-url
```

Fetches the HTML content from a given URL, bypassing CORS restrictions.

**Request Body:**
```json
{
  "url": "https://example.com/tour-page"
}
```

**Response:**
```json
{
  "success": true,
  "content": "<!DOCTYPE html>...",
  "url": "https://example.com/tour-page",
  "contentType": "text/html; charset=utf-8"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch URL: Not Found"
}
```

---

### Extract Tour with AI
```
POST /api/extract-tour
```

Extracts structured tour information from HTML content using AI.

**Request Body:**
```json
{
  "htmlContent": "<!DOCTYPE html>...",
  "url": "https://example.com/tour-page",
  "provider": "openai"  // optional: "openai" or "anthropic"
}
```

**Response:**
```json
{
  "success": true,
  "provider": "openai",
  "data": {
    "name": "Spring Tour 2025",
    "description": "A nationwide theatre tour",
    "venues": [
      {
        "id": "venue-0",
        "name": "Broadway Theatre",
        "address": "1681 Broadway",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "startDate": "2025-03-15",
        "endDate": "2025-03-20",
        "durationDays": 5,
        "latitude": 0,
        "longitude": 0
      }
    ]
  }
}
```

---

### Geocode Address
```
POST /api/geocode
```

Converts an address to geographic coordinates.

**Request Body:**
```json
{
  "address": "1681 Broadway, New York, NY",
  "provider": "nominatim"  // optional: "nominatim", "opencage", or "google"
}
```

**Response:**
```json
{
  "success": true,
  "latitude": 40.763216,
  "longitude": -73.982991,
  "formattedAddress": "Broadway Theatre, 1681 Broadway, New York, NY 10019, USA",
  "provider": "nominatim"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No results found"
}
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3001 | Server port |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | Yes* | - | Anthropic API key |
| `OPENAI_MODEL` | No | gpt-4-turbo-preview | OpenAI model to use |
| `ANTHROPIC_MODEL` | No | claude-3-5-sonnet-20241022 | Anthropic model to use |
| `OPENCAGE_API_KEY` | No | - | OpenCage geocoding API key |
| `GOOGLE_MAPS_API_KEY` | No | - | Google Maps API key |
| `ALLOWED_ORIGINS` | No | localhost:5173,localhost:3000 | Comma-separated CORS origins |

*At least one AI provider key is required

### CORS Configuration

By default, the server allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Common React dev server)

To allow additional origins, set the `ALLOWED_ORIGINS` environment variable:
```env
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com
```

## Security Features

1. **API Key Protection**: All API keys are stored server-side and never exposed to the frontend
2. **Input Validation**: All endpoints validate input data before processing
3. **URL Whitelisting**: Only HTTP/HTTPS protocols are allowed
4. **Content Type Validation**: Only HTML content is accepted for fetching
5. **CORS Protection**: Configurable allowed origins
6. **Error Sanitization**: Error messages don't expose sensitive information

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Description of the error"
}
```

HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid input)
- `500`: Server error

## Development

### Prerequisites
- Node.js 18+ (for native fetch support)
- npm or yarn

### Project Structure
```
backend/
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (not in git)
├── .env.example      # Example environment variables
└── README.md         # This file
```

### Testing the Server

You can test the endpoints using curl:

```bash
# Health check
curl http://localhost:3001/health

# Fetch URL
curl -X POST http://localhost:3001/api/fetch-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Geocode address
curl -X POST http://localhost:3001/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"Broadway Theatre, New York, NY"}'
```

## Deployment

### Using Node.js
```bash
npm install
npm start
```

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name morganmap-backend
pm2 save
pm2 startup
```

### Environment Variables for Production
Make sure to set:
- `PORT` (if different from 3001)
- `ALLOWED_ORIGINS` (your production frontend URL)
- At least one AI API key
- (Optional) Geocoding API keys

## Troubleshooting

### "No AI API key configured" error
- Make sure you've created a `.env` file in the backend directory
- Add either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to the `.env` file
- Restart the server

### CORS errors
- Verify your frontend origin is in the `ALLOWED_ORIGINS` list
- Check that the frontend is making requests to the correct backend URL

### Geocoding failures
- Nominatim has rate limits (1 request/second)
- Consider using OpenCage or Google Maps for production
- Add appropriate delays between requests

## License

MIT
