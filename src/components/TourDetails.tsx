import React, { useState } from 'react';
import { Tour, Venue } from '../types/tour';

interface TourDetailsProps {
  tour: Tour | null;
  onVenueClick: (venue: Venue) => void;
}

/**
 * TourDetails Component
 *
 * A sidebar component that displays detailed information about a tour.
 * Shows tour summary statistics, description, and a scrollable list of venues.
 * Allows users to click on venues to interact with the map.
 *
 * @param tour - The tour object containing venues, routes, and metadata (null shows empty state)
 * @param onVenueClick - Callback function fired when a venue is clicked
 */
export const TourDetails: React.FC<TourDetailsProps> = ({ tour, onVenueClick }) => {
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenueId(venue.id);
    onVenueClick(venue);
  };

  // Format date to readable string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate total distance from routes
  const calculateTotalDistance = (): { km: number; miles: number } => {
    if (!tour) return { km: 0, miles: 0 };
    const totalKm = tour.routes.reduce((sum, route) => sum + route.distanceKm, 0);
    const totalMiles = tour.routes.reduce((sum, route) => sum + route.distanceMiles, 0);
    return { km: totalKm, miles: totalMiles };
  };

  // Empty state when no tour is selected
  if (!tour) {
    return (
      <div className="w-96 h-full bg-gray-50 border-l border-gray-200 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.553-.894L15 11"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tour Selected</h3>
          <p className="text-sm text-gray-500">
            Select or create a tour to view details and explore venues on the map
          </p>
        </div>
      </div>
    );
  }

  const totalDistance = calculateTotalDistance();
  const venueCount = tour.venues.length;

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-2">{tour.name}</h2>
        {tour.description && (
          <p className="text-blue-100 text-sm leading-relaxed">{tour.description}</p>
        )}
      </div>

      {/* Statistics Section */}
      <div className="bg-blue-50 border-b border-gray-200 p-4 flex-shrink-0">
        <div className="grid grid-cols-3 gap-4">
          {/* Venues Statistic */}
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{venueCount}</div>
            <div className="text-xs text-gray-600 font-medium">
              {venueCount === 1 ? 'Venue' : 'Venues'}
            </div>
          </div>

          {/* Duration Statistic */}
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{tour.totalDurationDays}</div>
            <div className="text-xs text-gray-600 font-medium">
              {tour.totalDurationDays === 1 ? 'Day' : 'Days'}
            </div>
          </div>

          {/* Distance Statistic */}
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{totalDistance.miles.toFixed(0)}</div>
            <div className="text-xs text-gray-600 font-medium">Miles</div>
          </div>
        </div>

        {/* Date Range */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2 font-semibold">TOUR DATES</div>
          <div className="text-sm text-gray-700">
            {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
          </div>
        </div>
      </div>

      {/* Venues List Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
            Venues ({venueCount})
          </h3>

          <div className="space-y-3">
            {tour.venues.map((venue, index) => (
              <button
                key={venue.id}
                onClick={() => handleVenueClick(venue)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  selectedVenueId === venue.id
                    ? 'bg-blue-50 border-blue-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {/* Venue Number and Name */}
                <div className="flex items-start mb-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{venue.name}</h4>
                    <p className="text-sm text-gray-500 truncate">
                      {venue.city}
                      {venue.state && `, ${venue.state}`}
                    </p>
                  </div>
                </div>

                {/* Venue Dates and Duration */}
                <div className="ml-11 space-y-1 text-xs">
                  <div className="text-gray-600">
                    <span className="font-medium">Start:</span> {formatDate(venue.startDate)}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">End:</span> {formatDate(venue.endDate)}
                  </div>
                  <div className="inline-block mt-2 bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                    {venue.durationDays} {venue.durationDays === 1 ? 'day' : 'days'}
                  </div>
                </div>

                {/* Address Preview */}
                <div className="ml-11 mt-2 text-xs text-gray-500 line-clamp-2">
                  {venue.address}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Route Summary */}
      {tour.routes.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Route Summary
          </div>
          <div className="text-sm text-gray-700">
            <div className="mb-1">
              <span className="font-medium">{tour.routes.length}</span> route
              {tour.routes.length !== 1 ? 's' : ''} total
            </div>
            <div className="text-gray-600">
              <span className="font-medium">{totalDistance.km.toFixed(1)}</span> km (
              <span className="font-medium">{totalDistance.miles.toFixed(1)}</span> mi)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetails;
