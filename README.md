# MorganMap - Theatre Tour Mapping Application

An AI-powered web application that visualizes theatre tours on an interactive map. Simply provide a tour URL, and MorganMap will extract venue information, geocode locations, and display the complete tour route with distances and durations.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### Current Features
- AI-powered tour data extraction from URLs
- Interactive Leaflet map visualization
- Multi-provider geocoding support (Nominatim, OpenCage, Google Maps)
- Automatic distance calculations between venues
- Route visualization with connecting lines
- Duration display for each venue stop
- Responsive design with Tailwind CSS

### Planned Features
- Color-coded venues by time period or region
- Venue markers with detailed popups
- Tour details sidebar with statistics
- Manual data entry and editing
- Export tour data (JSON, CSV)
- Shareable tour links
- Multiple tour comparison

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet.js with React-Leaflet
- **Build Tool**: Vite
- **AI Integration**: OpenAI GPT-4 or Anthropic Claude
- **Geocoding**: Nominatim (default, free), OpenCage, or Google Maps API
- **Hosting**: Vercel (recommended) or similar platform

## Prerequisites

- Node.js 18+ and npm
- API key for AI service (OpenAI or Anthropic)
- Optional: API key for geocoding service (for higher rate limits)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/[your-username]/morganmap.git
cd morganmap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: Choose one AI provider
VITE_OPENAI_API_KEY=your_openai_api_key_here
# OR
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: For enhanced geocoding
VITE_OPENCAGE_API_KEY=your_opencage_api_key_here
# OR
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Basic Workflow

1. **Enter Tour URL**: Paste a link to a theatre tour announcement, press release, or venue listing
2. **Extract Data**: Click "Extract Tour" - the AI will parse the page and extract venue information
3. **Review Results**: Check the extracted venues, dates, and locations
4. **View on Map**: The interactive map displays all venues with routes connecting them
5. **Explore Details**: Click markers for venue information, hover over routes for distances

### Supported URL Types

- Official tour announcement pages
- Theatre press releases
- Venue websites with tour schedules
- News articles about tours
- Social media posts with tour information

### Manual Entry Fallback

If AI extraction fails or for custom tours:
1. Click "Manual Entry" option
2. Add venues one by one with:
   - Venue name
   - Address/location
   - Start and end dates
3. View your custom tour on the map

## API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Add to `.env` as `VITE_OPENAI_API_KEY`
5. Cost: ~$0.01-0.03 per tour extraction

### Anthropic Claude API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate a new API key
4. Add to `.env` as `VITE_ANTHROPIC_API_KEY`
5. Cost: Similar to OpenAI

### Geocoding Options

**Nominatim (Default - FREE)**
- No API key required
- Rate limit: 1 request per second
- Good for: Development and low-volume usage

**OpenCage (Optional)**
- Free tier: 2,500 requests/day
- Sign up at [OpenCage](https://opencagedata.com/)
- Good for: Medium-volume production usage

**Google Maps (Optional)**
- $200 free credit per month
- Sign up at [Google Cloud Console](https://console.cloud.google.com/)
- Good for: High accuracy requirements

## Project Structure

```
morganmap/
├── api/                      # Serverless API functions (future)
├── public/                   # Static assets
├── src/
│   ├── components/          # React components
│   ├── services/            # Business logic
│   │   ├── ai.ts           # AI service wrapper
│   │   ├── geocoding.ts    # Geocoding service
│   │   └── distance.ts     # Distance calculations
│   ├── types/              # TypeScript definitions
│   │   └── tour.ts         # Tour data types
│   ├── App.tsx             # Main application (to be created)
│   ├── main.tsx            # Entry point (to be created)
│   └── index.css           # Global styles
├── .env.example            # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── README.md              # This file
└── IMPLEMENTATION_PLAN.md # Detailed implementation guide
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling
- Functional React components with hooks

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push

### Netlify

1. Push code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy

### Other Platforms

The app is a standard Vite React application and can be deployed to:
- GitHub Pages
- AWS S3 + CloudFront
- DigitalOcean App Platform
- Any static hosting service

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 1: Foundation ✓
- [x] Project setup and configuration
- [x] TypeScript type definitions
- [x] Core services (AI, geocoding, distance)

### Phase 2: UI Components (In Progress)
- [ ] TourInput component
- [ ] MapView with Leaflet
- [ ] Venue markers and popups
- [ ] Route line visualization
- [ ] Tour details sidebar

### Phase 3: API Integration
- [ ] Serverless tour extraction function
- [ ] Geocoding endpoint
- [ ] Route calculation endpoint

### Phase 4: Polish
- [ ] Manual editing capability
- [ ] Data export features
- [ ] Enhanced error handling
- [ ] Performance optimization

### Phase 5: Advanced Features
- [ ] Multiple tour comparison
- [ ] Timeline view
- [ ] Statistics dashboard
- [ ] Social sharing

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed roadmap.

## Troubleshooting

### Common Issues

**AI extraction fails**
- Check API key is correct in `.env`
- Verify API key has sufficient credits
- Try a different tour URL
- Use manual entry as fallback

**Geocoding rate limit errors**
- Using Nominatim: Wait 1 second between requests (automatic)
- Consider upgrading to OpenCage or Google Maps API
- Check API key quotas

**Map not displaying**
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Check internet connection (map tiles need to load)

**Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 18+

## License

MIT License - See [LICENSE](LICENSE) file for details

## Acknowledgments

- [Leaflet](https://leafletjs.com/) for mapping functionality
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [OpenAI](https://openai.com/) and [Anthropic](https://anthropic.com/) for AI capabilities
- [Nominatim](https://nominatim.org/) for free geocoding

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed documentation

## Author

Created for theatre tour visualization and planning.

---

**Project Status**: In active development (Phase 1 complete)

**Last Updated**: 2025-11-07
