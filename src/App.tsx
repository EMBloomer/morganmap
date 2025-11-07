import { useState } from 'react';
import { Tour, Venue } from './types/tour';
import { AIService } from './services/ai';
import { GeocodingService } from './services/geocoding';
import { DistanceService } from './services/distance';
import TourInput from './components/TourInput';
import LoadingState from './components/LoadingState';
import MapView from './components/MapView';
import VenueMarker from './components/VenueMarker';
import RouteLines from './components/RouteLines';
import Legend from './components/Legend';
import TourDetails from './components/TourDetails';

function App() {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [_selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const handleExtractTour = async (url: string) => {
    setLoading(true);
    setError(null);
    setLoadingMessage('Fetching webpage content...');

    try {
      // Step 1: Fetch webpage content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch webpage');
      }
      const htmlContent = await response.text();

      // Step 2: Extract tour data with AI
      setLoadingMessage('Extracting tour data with AI...');

      // Get API keys from environment
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

      if (!openaiKey && !anthropicKey) {
        throw new Error('No AI API key found. Please add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to your .env file');
      }

      const aiService = new AIService({
        provider: openaiKey ? 'openai' : 'anthropic',
        apiKey: (openaiKey || anthropicKey)!,
      });

      const extractedData = await aiService.extractTourData(htmlContent, url);

      if (!extractedData.venues || extractedData.venues.length === 0) {
        throw new Error('No venues found in the tour data');
      }

      // Step 3: Geocode each venue
      setLoadingMessage(`Geocoding ${extractedData.venues.length} venues...`);

      const geocodingService = new GeocodingService('nominatim');
      const geocodedVenues: Venue[] = [];

      for (let i = 0; i < extractedData.venues.length; i++) {
        const venue = extractedData.venues[i];
        setLoadingMessage(`Geocoding venue ${i + 1} of ${extractedData.venues.length}: ${venue.name}...`);

        // Build full address for geocoding
        const addressParts = [
          venue.address,
          venue.city,
          venue.state,
          venue.country,
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        const geocodeResult = await geocodingService.geocode(fullAddress);

        if (geocodeResult.success && geocodeResult.latitude && geocodeResult.longitude) {
          geocodedVenues.push({
            ...venue,
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude,
          } as Venue);
        } else {
          console.warn(`Failed to geocode venue: ${venue.name}`, geocodeResult.error);
          // Try with just city and country as fallback
          const fallbackAddress = [venue.city, venue.country].filter(Boolean).join(', ');
          const fallbackResult = await geocodingService.geocode(fallbackAddress);

          if (fallbackResult.success && fallbackResult.latitude && fallbackResult.longitude) {
            geocodedVenues.push({
              ...venue,
              latitude: fallbackResult.latitude,
              longitude: fallbackResult.longitude,
            } as Venue);
          }
        }

        // Rate limiting for Nominatim (1 request per second)
        if (i < extractedData.venues.length - 1) {
          await geocodingService.delay(1000);
        }
      }

      if (geocodedVenues.length === 0) {
        throw new Error('Failed to geocode any venues');
      }

      // Step 4: Calculate routes
      setLoadingMessage('Calculating routes...');
      const routes = DistanceService.calculateRoutes(geocodedVenues);

      // Step 5: Calculate total duration
      const sortedVenues = [...geocodedVenues].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      const firstVenue = sortedVenues[0];
      const lastVenue = sortedVenues[sortedVenues.length - 1];
      const totalDurationDays = Math.ceil(
        (new Date(lastVenue.endDate).getTime() - new Date(firstVenue.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      );

      // Create the complete tour object
      const completeTour: Tour = {
        id: `tour-${Date.now()}`,
        name: extractedData.name || 'Theatre Tour',
        description: extractedData.description,
        venues: geocodedVenues,
        routes,
        startDate: firstVenue.startDate,
        endDate: lastVenue.endDate,
        totalDurationDays,
      };

      setTour(completeTour);
      setLoadingMessage('Tour loaded successfully!');
    } catch (err) {
      console.error('Error extracting tour:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract tour data');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    // TODO: Focus map on this venue
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">🗺️ MorganMap</h1>
          <p className="text-blue-100 text-sm">AI-Powered Theatre Tour Mapping</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Tour Input */}
        {!tour && (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <TourInput
              onExtract={handleExtractTour}
              loading={loading}
              error={error}
            />

            {/* Instructions */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">How It Works</h2>
              <ol className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">1</span>
                  <span>Paste a URL to a theatre tour announcement, press release, or venue listing</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">2</span>
                  <span>Our AI extracts venue information, dates, and locations from the page</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">3</span>
                  <span>Venues are geocoded and displayed on an interactive map with routes</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">4</span>
                  <span>Explore distances, durations, and tour details</span>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Setup Required:</strong> Make sure you've added your API keys to the <code className="bg-yellow-100 px-1 rounded">.env</code> file.
                  See the README for instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map and Details */}
        {tour && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <TourDetails tour={tour} onVenueClick={handleVenueClick} />

            {/* Map Container */}
            <div className="flex-1 relative">
              <MapView venues={tour.venues} routes={tour.routes}>
                {/* Render route lines */}
                <RouteLines routes={tour.routes} />

                {/* Render venue markers */}
                {tour.venues.map((venue, index) => (
                  <VenueMarker
                    key={venue.id}
                    venue={venue}
                    index={index}
                  />
                ))}
              </MapView>

              {/* Legend */}
              <Legend position="top-right" collapsible={true} />

              {/* Reset Button */}
              <button
                onClick={() => {
                  setTour(null);
                  setError(null);
                  setSelectedVenue(null);
                }}
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors z-[500]"
              >
                ← New Tour
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay */}
      {loading && <LoadingState message={loadingMessage} />}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-4 text-center text-sm">
        <div className="container mx-auto px-4">
          <p>
            MorganMap - Theatre Tour Mapping Application | Powered by AI & OpenStreetMap
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
