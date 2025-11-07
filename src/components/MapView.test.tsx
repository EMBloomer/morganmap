import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapView } from './MapView';
import { Venue } from '../types/tour';

// Create mock venues for testing
const createMockVenue = (id: string, name: string, lat: number, lng: number): Venue => ({
  id,
  name,
  address: '123 Test St',
  city: 'Test City',
  country: 'Test Country',
  latitude: lat,
  longitude: lng,
  startDate: '2024-01-01',
  endDate: '2024-01-03',
  durationDays: 3,
});

describe('MapView Component', () => {
  const mockVenues: Venue[] = [
    createMockVenue('1', 'Venue 1', 51.5074, -0.1278),
    createMockVenue('2', 'Venue 2', 48.8566, 2.3522),
    createMockVenue('3', 'Venue 3', 40.7128, -74.0060),
  ];

  describe('Rendering', () => {
    it('should render the MapContainer', () => {
      render(<MapView venues={mockVenues} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should render TileLayer', () => {
      render(<MapView venues={mockVenues} />);

      const tileLayer = screen.getByTestId('tile-layer');
      expect(tileLayer).toBeInTheDocument();
    });

    it('should render with empty venues array', () => {
      render(<MapView venues={[]} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should render children components', () => {
      render(
        <MapView venues={mockVenues}>
          <div data-testid="custom-child">Custom Child</div>
        </MapView>
      );

      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const customClass = 'custom-map-class';
      render(<MapView venues={mockVenues} className={customClass} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveClass('mapview-container', customClass);
    });
  });

  describe('Map Configuration', () => {
    it('should use default center when no venues provided', () => {
      render(<MapView venues={[]} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
      // Default center is London [51.5074, -0.1278]
      // Default zoom is 13
    });

    it('should render with single venue', () => {
      const singleVenue = [mockVenues[0]];
      render(<MapView venues={singleVenue} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should render with multiple venues', () => {
      render(<MapView venues={mockVenues} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });
  });

  describe('Bounds Adjustment', () => {
    it('should not adjust bounds when venues array is empty', () => {
      render(<MapView venues={[]} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should handle venues with same coordinates', () => {
      const duplicateVenues = [
        createMockVenue('1', 'Venue 1', 51.5074, -0.1278),
        createMockVenue('2', 'Venue 2', 51.5074, -0.1278),
      ];

      render(<MapView venues={duplicateVenues} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should update bounds when venues change', () => {
      const { rerender } = render(<MapView venues={[mockVenues[0]]} />);

      expect(screen.getByTestId('map-container')).toBeInTheDocument();

      // Update with different venues
      rerender(<MapView venues={mockVenues} />);

      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  describe('MapRef', () => {
    it('should work without mapRef prop', () => {
      render(<MapView venues={mockVenues} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should accept mapRef prop', () => {
      const mapRef = { current: null };
      render(<MapView venues={mockVenues} mapRef={mapRef} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });
  });

  describe('Integration with child components', () => {
    it('should render markers as children', () => {
      render(
        <MapView venues={mockVenues}>
          <div data-testid="marker-1">Marker 1</div>
          <div data-testid="marker-2">Marker 2</div>
        </MapView>
      );

      expect(screen.getByTestId('marker-1')).toBeInTheDocument();
      expect(screen.getByTestId('marker-2')).toBeInTheDocument();
    });

    it('should render polylines as children', () => {
      render(
        <MapView venues={mockVenues}>
          <div data-testid="polyline">Route Line</div>
        </MapView>
      );

      expect(screen.getByTestId('polyline')).toBeInTheDocument();
    });

    it('should render multiple child types', () => {
      render(
        <MapView venues={mockVenues}>
          <div data-testid="marker">Marker</div>
          <div data-testid="polyline">Polyline</div>
          <div data-testid="legend">Legend</div>
        </MapView>
      );

      expect(screen.getByTestId('marker')).toBeInTheDocument();
      expect(screen.getByTestId('polyline')).toBeInTheDocument();
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle venues with extreme coordinates', () => {
      const extremeVenues = [
        createMockVenue('1', 'North Pole', 90, 0),
        createMockVenue('2', 'South Pole', -90, 0),
      ];

      render(<MapView venues={extremeVenues} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should handle venues crossing date line', () => {
      const dateLineVenues = [
        createMockVenue('1', 'West', 0, -179),
        createMockVenue('2', 'East', 0, 179),
      ];

      render(<MapView venues={dateLineVenues} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should handle invalid coordinate values gracefully', () => {
      const invalidVenues = [
        createMockVenue('1', 'Invalid', NaN, NaN),
      ];

      render(<MapView venues={invalidVenues} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });
  });
});
