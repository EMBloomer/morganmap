import 'leaflet/dist/leaflet.css';
import React, { useEffect, ReactNode, RefObject } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LatLngBounds, Map as LeafletMap } from 'leaflet';
import { Venue } from '../types/tour';

interface MapViewProps {
  venues: Venue[];
  children?: ReactNode;
  className?: string;
  mapRef?: RefObject<LeafletMap | null>;
}

/**
 * Internal component to handle map bounds fitting
 * Uses the useMap hook to access the map instance
 */
function MapBoundsAdjuster({ venues }: { venues: Venue[] }): null {
  const map = useMap();

  useEffect(() => {
    if (venues.length === 0) {
      return;
    }

    // Create bounds from all venues
    const bounds = new LatLngBounds(
      venues.map(venue => [venue.latitude, venue.longitude])
    );

    // Fit the map to the bounds
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [venues, map]);

  return null;
}

/**
 * Internal component to capture map ref
 */
function MapRefCapture({ mapRef }: { mapRef?: RefObject<LeafletMap | null> }): null {
  const map = useMap();

  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  return null;
}

/**
 * MapView Component
 *
 * A React component that displays an interactive map using Leaflet.
 * It automatically fits the view to show all provided venues.
 *
 * @param venues - Array of venue locations to display on the map
 * @param children - Child components for custom markers, polylines, or other map elements
 * @param className - Optional CSS class name for the container
 * @param mapRef - Optional ref to access the Leaflet map instance
 */
export const MapView: React.FC<MapViewProps> = ({
  venues,
  children,
  className = '',
  mapRef,
}) => {
  // Default center (London) and zoom level if no venues provided
  const defaultCenter: [number, number] = [51.5074, -0.1278];
  const defaultZoom = 13;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      className={`mapview-container ${className}`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Component to capture map ref */}
      {mapRef && <MapRefCapture mapRef={mapRef} />}

      {/* Component to handle bounds adjustment */}
      {venues.length > 0 && <MapBoundsAdjuster venues={venues} />}

      {/* Children components for markers, polylines, etc. */}
      {children}
    </MapContainer>
  );
};

export default MapView;
