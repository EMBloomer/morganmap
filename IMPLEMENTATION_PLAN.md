# MorganMap - Theatre Tour Mapping Application
## Complete Implementation Plan

---

## Project Overview

An AI-powered web application that allows users to specify a theatre tour and visualizes all tour locations on an interactive map. The app features:
- AI-powered data extraction from tour URLs
- Interactive map with route visualization
- Color-coded venues by time period/region
- Distance calculations between venues
- Duration display for each venue stop

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet.js with React-Leaflet
- **Build Tool**: Vite

### Backend/Services
- **Serverless Functions**: Vercel Functions (or similar)
- **AI Integration**: OpenAI GPT-4 or Anthropic Claude API
- **Geocoding**: Nominatim (free), OpenCage, or Google Maps API
- **Web Scraping**: Fetch API + AI parsing

### APIs & Services
- **AI Provider**: OpenAI or Anthropic (user configurable)
- **Geocoding**: Multiple providers with fallback
- **Distance Calculation**: Haversine formula implementation

---

## Phase 1: Core Setup ✓ (COMPLETED)

### 1.1 Project Initialization ✓
- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies (React, Leaflet, Tailwind)
- [x] Set up TypeScript configuration
- [x] Configure Vite build tool

### 1.2 Project Structure ✓
```
morganmap/
├── public/
├── src/
│   ├── components/
│   ├── services/
│   │   ├── ai.ts ✓
│   │   ├── geocoding.ts ✓
│   │   └── distance.ts ✓
│   ├── types/
│   │   └── tour.ts ✓
│   └── index.css ✓
├── api/ (for serverless functions)
├── .env.example ✓
├── .gitignore ✓
└── package.json ✓
```

### 1.3 Configuration Files ✓
- [x] Tailwind CSS config
- [x] PostCSS config
- [x] TypeScript configs (tsconfig.json, tsconfig.node.json)
- [x] Environment variables template (.env.example)
- [x] Git ignore rules

### 1.4 Type Definitions ✓
- [x] Tour interface
- [x] Venue interface
- [x] Route interface
- [x] AI response types
- [x] Geocoding response types

### 1.5 Core Services ✓
- [x] AI Service wrapper (OpenAI & Anthropic support)
- [x] Geocoding service (multi-provider)
- [x] Distance calculation utilities

---

## Phase 2: UI Components (IN PROGRESS)

### 2.1 TourInput Component
**Purpose**: Allow users to input tour URL or manually enter venue data

**Features**:
- URL input field with validation
- "Extract Tour" button to trigger AI processing
- Loading state during AI extraction
- Error handling and display
- Manual entry fallback option

**Implementation**:
```typescript
// src/components/TourInput.tsx
- State: url, loading, error
- handleSubmit: fetch page content, call AI service
- Form with Tailwind styling
- Error message display
```

### 2.2 MapView Component
**Purpose**: Display interactive Leaflet map with tour visualization

**Features**:
- Leaflet map initialization
- Default center and zoom
- Tile layer (OpenStreetMap)
- Auto-fit bounds to show all venues
- Zoom controls

**Implementation**:
```typescript
// src/components/MapView.tsx
- Use react-leaflet MapContainer
- Configure tile layer
- Accept venues and routes as props
- Auto-calculate bounds
```

### 2.3 VenueMarker Component
**Purpose**: Custom markers for each venue on the map

**Features**:
- Color-coded markers
- Popup with venue details
- Duration display
- Date range display
- Venue name and address

**Implementation**:
```typescript
// src/components/VenueMarker.tsx
- Custom Leaflet marker with icon
- Popup component with venue info
- Color logic based on date/region
```

### 2.4 RouteLines Component
**Purpose**: Visualize connections between venues

**Features**:
- Lines connecting consecutive venues
- Distance labels along routes
- Color-coded by tour progression
- Animated lines (optional)

**Implementation**:
```typescript
// src/components/RouteLines.tsx
- Leaflet Polyline for each route
- Tooltip with distance info
- Color gradient based on order
```

### 2.5 TourDetails Sidebar
**Purpose**: Display tour information and venue list

**Features**:
- Tour name and description
- Total duration
- Total distance traveled
- List of all venues with details
- Click to focus on map

**Implementation**:
```typescript
// src/components/TourDetails.tsx
- Sidebar layout with Tailwind
- Venue list with cards
- Summary statistics
- Click handlers for map interaction
```

### 2.6 LoadingState Component
**Purpose**: Show AI processing status

**Features**:
- Loading spinner
- Progress messages
- Estimated time
- Cancel option (optional)

**Implementation**:
```typescript
// src/components/LoadingState.tsx
- Animated spinner
- Status message display
- Modal or overlay styling
```

### 2.7 Legend Component
**Purpose**: Explain color coding and symbols

**Features**:
- Color key for venues
- Symbol explanations
- Collapsible/expandable
- Positioned on map

**Implementation**:
```typescript
// src/components/Legend.tsx
- Fixed position on map
- Color swatches with labels
- Tailwind styling
```

---

## Phase 3: Serverless API Functions

### 3.1 Extract Tour Function
**Endpoint**: `/api/extract-tour`

**Purpose**: Fetch webpage content and extract tour data using AI

**Implementation**:
```typescript
// api/extract-tour.ts
import { AIService } from '../src/services/ai';

export default async function handler(req, res) {
  const { url, provider, apiKey } = req.body;

  // Fetch webpage content
  const response = await fetch(url);
  const html = await response.text();

  // Initialize AI service
  const aiService = new AIService({ provider, apiKey });

  // Extract tour data
  const tourData = await aiService.extractTourData(html, url);

  return res.json(tourData);
}
```

### 3.2 Geocode Venue Function
**Endpoint**: `/api/geocode-venue`

**Purpose**: Geocode venue addresses with AI enhancement

**Implementation**:
```typescript
// api/geocode-venue.ts
import { GeocodingService } from '../src/services/geocoding';
import { AIService } from '../src/services/ai';

export default async function handler(req, res) {
  const { venueName, address, aiProvider, apiKey } = req.body;

  // Normalize with AI if available
  if (aiProvider && apiKey) {
    const ai = new AIService({ provider: aiProvider, apiKey });
    const normalized = await ai.normalizeVenueName(venueName);
    address = normalized;
  }

  // Geocode
  const geocoder = new GeocodingService('nominatim');
  const result = await geocoder.geocode(address);

  return res.json(result);
}
```

### 3.3 Calculate Route Function
**Endpoint**: `/api/calculate-route`

**Purpose**: Calculate distances between venues

**Implementation**:
```typescript
// api/calculate-route.ts
import { DistanceService } from '../src/services/distance';

export default async function handler(req, res) {
  const { venues } = req.body;

  const routes = DistanceService.calculateRoutes(venues);
  const totalDistance = DistanceService.calculateTotalDistance(routes);

  return res.json({ routes, totalDistance });
}
```

---

## Phase 4: Main Application Integration

### 4.1 App.tsx - Main Component
**Purpose**: Integrate all components and manage application state

**State Management**:
```typescript
interface AppState {
  tour: Tour | null;
  loading: boolean;
  error: string | null;
  apiConfig: {
    aiProvider: 'openai' | 'anthropic';
    aiApiKey: string;
    geocodingProvider: string;
    geocodingApiKey?: string;
  };
}
```

**Flow**:
1. User inputs tour URL
2. Fetch webpage content
3. Call AI service to extract venues
4. Geocode each venue (with rate limiting)
5. Calculate routes
6. Display on map
7. Show tour details in sidebar

**Implementation**:
```typescript
// src/App.tsx
- useState for tour, loading, error
- handleTourSubmit: orchestrate extraction
- handleGeocoding: process venues sequentially
- handleRouteCalculation: calculate distances
- Render layout with components
```

### 4.2 Main Entry Point
```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Phase 5: Advanced Features

### 5.1 Data Export
- Export tour data as JSON
- Download venue list as CSV
- Share tour via URL parameters
- Save to local storage

### 5.2 Manual Editing
- Edit extracted venue data
- Add/remove venues
- Adjust dates and durations
- Reorder tour stops

### 5.3 Multiple Tours
- Compare multiple tours
- Save/load tour configurations
- Tour library management

### 5.4 Enhanced Visualization
- Different map styles (satellite, terrain)
- Heatmap of tour concentration
- Timeline view
- Statistics dashboard

### 5.5 Performance Optimization
- Cache geocoding results
- Lazy load components
- Optimize map rendering
- Debounce API calls

---

## Phase 6: Deployment & DevOps

### 6.1 Environment Configuration
- Production environment variables
- API key management
- CORS configuration
- Rate limiting

### 6.2 Build Optimization
- Code splitting
- Tree shaking
- Image optimization
- Bundle size analysis

### 6.3 Deployment Platforms
**Option 1: Vercel** (Recommended)
- Auto-deploy from GitHub
- Serverless functions built-in
- Environment variables management
- Free tier available

**Option 2: Netlify**
- Similar features to Vercel
- Netlify Functions
- Easy Git integration

**Option 3: Custom**
- VPS with Docker
- Nginx reverse proxy
- Node.js backend

### 6.4 Testing
- Unit tests for services
- Component tests with React Testing Library
- E2E tests with Playwright
- API endpoint tests

---

## API Keys Required

### AI Service (Choose One)
1. **OpenAI**
   - API Key from: https://platform.openai.com/api-keys
   - Cost: ~$0.01-0.03 per tour extraction
   - Model: GPT-4 Turbo

2. **Anthropic Claude**
   - API Key from: https://console.anthropic.com/
   - Cost: Similar to OpenAI
   - Model: Claude 3.5 Sonnet

### Geocoding Service (Optional)
1. **Nominatim** - FREE (default)
   - No API key needed
   - Rate limit: 1 req/sec
   - Best for: Low-cost projects

2. **OpenCage**
   - API Key from: https://opencagedata.com/
   - Free tier: 2,500 requests/day
   - Best for: Medium usage

3. **Google Maps**
   - API Key from: https://console.cloud.google.com/
   - Free tier: $200 credit/month
   - Best for: High accuracy needed

---

## Development Workflow

### Getting Started
```bash
# 1. Clone repository
git clone https://github.com/[username]/morganmap.git
cd morganmap

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Run development server
npm run dev

# 5. Open browser
# Visit http://localhost:5173
```

### Building for Production
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

---

## File Structure Reference

```
morganmap/
├── api/                          # Serverless functions
│   ├── extract-tour.ts          # AI tour extraction
│   ├── geocode-venue.ts         # Geocoding with AI
│   └── calculate-route.ts       # Distance calculations
├── public/                       # Static assets
│   └── vite.svg
├── src/
│   ├── components/              # React components
│   │   ├── TourInput.tsx       # URL input form
│   │   ├── MapView.tsx         # Leaflet map
│   │   ├── VenueMarker.tsx     # Map markers
│   │   ├── RouteLines.tsx      # Route visualization
│   │   ├── TourDetails.tsx     # Sidebar with info
│   │   ├── LoadingState.tsx    # Loading indicator
│   │   └── Legend.tsx          # Map legend
│   ├── services/               # Business logic
│   │   ├── ai.ts              # AI service wrapper
│   │   ├── geocoding.ts       # Geocoding service
│   │   └── distance.ts        # Distance calculations
│   ├── types/                  # TypeScript types
│   │   └── tour.ts            # Type definitions
│   ├── App.tsx                # Main application
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── .env.example               # Environment template
├── .gitignore                # Git ignore rules
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── postcss.config.js         # PostCSS config
├── tailwind.config.js        # Tailwind config
├── tsconfig.json             # TypeScript config
├── tsconfig.node.json        # Node TypeScript config
├── vite.config.ts            # Vite config
├── README.md                 # Documentation
└── IMPLEMENTATION_PLAN.md    # This file
```

---

## Next Steps for Implementation

### Immediate Tasks (Phase 2 - UI Components)
1. Create TourInput component with form handling
2. Build MapView component with Leaflet integration
3. Implement VenueMarker with popups
4. Add RouteLines for connections
5. Create TourDetails sidebar
6. Build LoadingState component
7. Add Legend component

### After Components (Phase 3 - API)
8. Implement serverless extract-tour function
9. Create geocode-venue endpoint
10. Build calculate-route function

### Integration (Phase 4)
11. Wire up App.tsx with all components
12. Implement data flow and state management
13. Add error handling throughout
14. Test with sample tour URLs

### Polish (Phase 5)
15. Add export/share functionality
16. Implement manual editing
17. Optimize performance
18. Add advanced visualizations

### Deploy (Phase 6)
19. Set up Vercel project
20. Configure environment variables
21. Deploy to production
22. Monitor and iterate

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Paste tour URL and extract data
- [ ] Verify all venues geocoded correctly
- [ ] Check route lines display properly
- [ ] Test marker popups show correct info
- [ ] Verify distances calculated accurately
- [ ] Test on different tour URLs
- [ ] Check mobile responsiveness
- [ ] Test with different AI providers
- [ ] Verify error handling works

### Sample Tour URLs for Testing
- Broadway tour announcements
- Theatre press releases
- Venue listing pages
- Social media tour posts

---

## Future Enhancements

### Advanced Features
- Multi-tour comparison
- Print-friendly tour maps
- PDF export with itinerary
- Calendar integration
- Travel time estimates
- Hotel/accommodation suggestions
- Budget tracking

### AI Improvements
- Vision model for screenshot parsing
- Better venue disambiguation
- Tour date prediction
- Venue capacity extraction
- Ticket price information

### Social Features
- Share tours publicly
- Comment on venues
- Rate venues
- Community tour database

---

## Support & Resources

### Documentation
- React: https://react.dev/
- Leaflet: https://leafletjs.com/
- Tailwind: https://tailwindcss.com/
- Vite: https://vitejs.dev/

### API Documentation
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com/
- Nominatim: https://nominatim.org/release-docs/latest/
- OpenCage: https://opencagedata.com/api

### Community
- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and share ideas

---

## License & Contributing

### License
[Specify license - e.g., MIT]

### Contributing
Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Last Updated**: 2025-11-07
**Version**: 0.1.0
**Status**: Phase 1 Complete, Phase 2 In Progress
