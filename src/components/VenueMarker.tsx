import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon, DivIcon } from 'leaflet';
import { Venue } from '../types/tour';
import { formatDate } from '../utils/helpers';

interface VenueMarkerProps {
  venue: Venue;
  index: number;
  color?: string;
}

/**
 * VenueMarker Component
 * Displays a Leaflet marker for a venue with a popup containing venue details.
 * Markers are color-coded based on the venue's position in the tour.
 */
const VenueMarker: React.FC<VenueMarkerProps> = ({ venue, index, color }) => {

  /**
   * Build full address from venue components
   */
  const buildFullAddress = (): string => {
    const parts = [venue.address, venue.city];
    if (venue.state) {
      parts.push(venue.state);
    }
    parts.push(venue.country);
    return parts.join(', ');
  };

  /**
   * Get a color for the marker based on index or provided color prop
   */
  const getMarkerColor = (): string => {
    if (color) {
      return color;
    }

    // Default color progression for markers (matches Legend.tsx)
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Light Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
      '#BB8FCE', // Purple
      '#85C1E2', // Sky Blue
      '#F8B88B', // Peach
      '#52B788', // Green
    ];

    return colors[index % colors.length];
  };

  const markerColor = getMarkerColor();

  /**
   * Create a custom colored marker icon using divIcon
   * This ensures markers match the colors shown in the legend
   */
  const customIcon: DivIcon = useMemo(() => {
    return divIcon({
      html: `
        <div style="
          background-color: ${markerColor};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            color: white;
            font-weight: bold;
            font-size: 14px;
            transform: rotate(45deg);
          ">${index + 1}</span>
        </div>
      `,
      className: 'custom-marker-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }, [markerColor, index]);

  return (
    <Marker
      position={[venue.latitude, venue.longitude]}
      icon={customIcon}
    >
      <Popup maxWidth={300} className="venue-popup">
        <div className="p-2 w-full">
          {/* Venue Name */}
          <h3 className="font-bold text-lg text-gray-900 mb-2">{venue.name}</h3>

          {/* Full Address */}
          <div className="mb-3">
            <p className="text-sm text-gray-700">{buildFullAddress()}</p>
          </div>

          {/* Dates Section */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="text-xs text-gray-600 mb-1 font-semibold">
              Dates
            </div>
            <p className="text-sm text-gray-800">
              {formatDate(venue.startDate)} to {formatDate(venue.endDate)}
            </p>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 font-semibold">
              Duration
            </span>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {venue.durationDays} {venue.durationDays === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Venue Index Indicator */}
          <div className="mt-2 pt-2 text-center">
            <span
              className="inline-block w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: markerColor }}
            >
              {index + 1}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default VenueMarker;
