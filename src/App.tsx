function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">MorganMap</h1>
          <p className="text-sm text-gray-600 mt-1">
            Theatre Tour Mapping Application
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to MorganMap</h2>
          <p className="text-gray-600 mb-4">
            Phase 1 (Foundation) is complete! The core services are ready:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>✓ AI Service (OpenAI & Anthropic support)</li>
            <li>✓ Geocoding Service (Nominatim, OpenCage, Google Maps)</li>
            <li>✓ Distance Calculation Service</li>
            <li>✓ TypeScript Type Definitions</li>
          </ul>
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Next Step:</strong> Phase 2 will implement the UI components
              (TourInput, MapView, VenueMarker, etc.)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
