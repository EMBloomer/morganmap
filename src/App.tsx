import { useState, useRef } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { Tour, Venue } from './types/tour';
import { AIService } from './services/ai';
import { GeocodingService } from './services/geocoding';
import { DistanceService } from './services/distance';
import { config } from './config';
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
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [skippedVenues, setSkippedVenues] = useState<string[]>([]);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleExtractTour = async (url: string) => {
    setLoading(true);
    setError(null);
    setSkippedVenues([]);
    setLoadingMessage('Fetching webpage content...');

    try {
      // Step 1: Fetch webpage content via backend proxy (fixes CORS issue)
      const fetchResponse = await fetch(`${config.backendUrl}/api/fetch-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({ error: fetchResponse.statusText }));
        throw new Error(errorData.error || 'Failed to fetch webpage. The website may be blocking requests or the URL is invalid.');
      }

      const { content: htmlContent } = await fetchResponse.json();

      // Note: HTML content is limited to first 10,000 characters on the backend
      // to optimize AI processing speed and cost. This is usually sufficient
      // to extract venue information from most tour pages.

      // Step 2: Extract tour data with AI via backend (fixes API key exposure)
      setLoadingMessage('Extracting tour data with AI...');

      const aiService = new AIService();
      const extractedData = await aiService.extractTourData(htmlContent, url);

      // Validate extracted data structure
      if (!extractedData || typeof extractedData !== 'object') {
        throw new Error('Invalid data received from AI service');
      }

      if (!Array.isArray(extractedData.venues) || extractedData.venues.length === 0) {
        throw new Error('No venues found in the tour data. The page may not contain tour information.');
      }

      // Step 3: Geocode each venue
      setLoadingMessage(`Geocoding ${extractedData.venues.length} venues...`);

      const geocodingService = new GeocodingService();
      const geocodedVenues: Venue[] = [];
      const skipped: string[] = [];

      for (let i = 0; i < extractedData.venues.length; i++) {
        const venue = extractedData.venues[i];

        // Validate venue has required fields
        if (!venue.name || !venue.city) {
          skipped.push(venue.name || `Venue ${i + 1}`);
          continue;
        }

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
          // Validate coordinates are valid numbers
          if (typeof geocodeResult.latitude === 'number' && typeof geocodeResult.longitude === 'number') {
            geocodedVenues.push({
              ...venue,
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
            } as Venue);
          } else {
            skipped.push(venue.name);
          }
        } else {
          // Try with just city and country as fallback
          const fallbackAddress = [venue.city, venue.country].filter(Boolean).join(', ');
          const fallbackResult = await geocodingService.geocode(fallbackAddress);

          if (fallbackResult.success && fallbackResult.latitude && fallbackResult.longitude &&
              typeof fallbackResult.latitude === 'number' && typeof fallbackResult.longitude === 'number') {
            geocodedVenues.push({
              ...venue,
              latitude: fallbackResult.latitude,
              longitude: fallbackResult.longitude,
            } as Venue);
          } else {
            // Venue could not be geocoded
            skipped.push(venue.name);
          }
        }

        // Rate limiting (1 request per second)
        if (i < extractedData.venues.length - 1) {
          await geocodingService.delay(1000);
        }
      }

      if (geocodedVenues.length === 0) {
        throw new Error('Failed to geocode any venues. The addresses may be incomplete or invalid.');
      }

      // Store skipped venues for user notification
      setSkippedVenues(skipped);

      // Step 4: Sort venues chronologically by start date (fixes route ordering issue)
      const sortedVenues = [...geocodedVenues].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      // Step 5: Calculate routes based on chronological order
      setLoadingMessage('Calculating routes...');
      const routes = DistanceService.calculateRoutes(sortedVenues);

      // Step 6: Calculate total duration
      const firstVenue = sortedVenues[0];
      const lastVenue = sortedVenues[sortedVenues.length - 1];
      const totalDurationDays = Math.ceil(
        (new Date(lastVenue.endDate).getTime() - new Date(firstVenue.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      );

      // Create the complete tour object with sorted venues
      const completeTour: Tour = {
        id: `tour-${Date.now()}`,
        name: extractedData.name || 'Theatre Tour',
        description: extractedData.description,
        venues: sortedVenues,
        routes,
        startDate: firstVenue.startDate,
        endDate: lastVenue.endDate,
        totalDurationDays,
      };

      setTour(completeTour);
      setLoadingMessage(''); // Reset loading message after success
    } catch (err) {
      console.error('Error extracting tour:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract tour data');
      setLoadingMessage(''); // Reset loading message on error
    } finally {
      setLoading(false);
    }
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    // Focus map on the selected venue
    if (mapRef.current) {
      mapRef.current.setView([venue.latitude, venue.longitude], 13, {
        animate: true,
        duration: 0.5,
      });
    }
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
      <main className="flex-1 flex flex-col overflow-hidden" role="main">
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
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5" aria-hidden="true">1</span>
                  <span>Paste a URL to a theatre tour announcement, press release, or venue listing</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5" aria-hidden="true">2</span>
                  <span>Our AI extracts venue information, dates, and locations from the page (limited to first 10,000 characters for optimal performance)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5" aria-hidden="true">3</span>
                  <span>Venues are geocoded and displayed on an interactive map with routes</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5" aria-hidden="true">4</span>
                  <span>Explore distances, durations, and tour details (use Tab key to navigate, Enter to select venues)</span>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Setup Required:</strong> Make sure the backend server is running with API keys configured.
                  See the backend README for instructions.
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
              {/* Skipped Venues Notification */}
              {skippedVenues.length > 0 && (
                <div
                  className="absolute top-4 left-4 right-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-lg z-[1000]"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-1">Some venues could not be geocoded</h3>
                      <p className="text-sm text-yellow-800">
                        The following {skippedVenues.length} venue{skippedVenues.length > 1 ? 's were' : ' was'} skipped due to incomplete address information: <strong>{skippedVenues.join(', ')}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => setSkippedVenues([])}
                      className="text-yellow-600 hover:text-yellow-800 transition-colors"
                      aria-label="Dismiss notification"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <MapView venues={tour.venues} mapRef={mapRef}>
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
                  setSkippedVenues([]);
                }}
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors z-[500]"
                aria-label="Load a new tour"
              >
                ← New Tour
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div role="status" aria-live="assertive">
          <LoadingState message={loadingMessage} />
        </div>
      )}

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
