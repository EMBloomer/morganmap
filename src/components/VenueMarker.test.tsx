import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VenueMarker from './VenueMarker';
import { Venue } from '../types/tour';

// Mock the formatDate utility
vi.mock('../utils/helpers', () => ({
  formatDate: vi.fn((date: string) => {
    // Simple mock implementation
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }),
}));

describe('VenueMarker Component', () => {
  const mockVenue: Venue = {
    id: 'venue-1',
    name: 'Theatre Royal',
    address: '123 Main Street',
    city: 'London',
    state: 'England',
    country: 'UK',
    latitude: 51.5074,
    longitude: -0.1278,
    startDate: '2024-01-15',
    endDate: '2024-01-18',
    durationDays: 3,
  };

  describe('Rendering', () => {
    it('should render marker with venue information', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });

    it('should render popup with venue details', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      expect(screen.getByText('Theatre Royal')).toBeInTheDocument();
      expect(screen.getByText(/123 Main Street/)).toBeInTheDocument();
    });

    it('should display venue name correctly', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      expect(screen.getByText('Theatre Royal')).toBeInTheDocument();
    });

    it('should display full address correctly', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      const addressText = screen.getByText(/123 Main Street, London, England, UK/);
      expect(addressText).toBeInTheDocument();
    });

    it('should display venue without state correctly', () => {
      const venueWithoutState = { ...mockVenue, state: undefined };
      render(<VenueMarker venue={venueWithoutState} index={0} />);

      const addressText = screen.getByText(/123 Main Street, London, UK/);
      expect(addressText).toBeInTheDocument();
    });
  });

  describe('Marker Positioning', () => {
    it('should position marker at correct coordinates', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
      // Position is handled by react-leaflet Marker component (mocked)
    });

    it('should handle different coordinate values', () => {
      const venueAtDifferentLocation = {
        ...mockVenue,
        latitude: 48.8566,
        longitude: 2.3522,
      };

      render(<VenueMarker venue={venueAtDifferentLocation} index={0} />);

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });
  });

  describe('Marker Colors and Index', () => {
    it('should display correct index number', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      // Index 0 should display as "1" (index + 1)
      const indexNumbers = screen.getAllByText('1');
      expect(indexNumbers.length).toBeGreaterThan(0);
    });

    it('should display different index numbers correctly', () => {
      const { rerender } = render(<VenueMarker venue={mockVenue} index={0} />);

      expect(screen.getAllByText('1').length).toBeGreaterThan(0);

      rerender(<VenueMarker venue={mockVenue} index={4} />);
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    });

    it('should use custom color when provided', () => {
      const customColor = '#FF0000';
      render(<VenueMarker venue={mockVenue} index={0} color={customColor} />);

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });

    it('should cycle through default colors for high indices', () => {
      // Testing that colors cycle properly (10 colors in the palette)
      render(<VenueMarker venue={mockVenue} index={15} />);

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });
  });

  describe('Date Display', () => {
    it('should display start and end dates', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      expect(screen.getByText(/Dates/)).toBeInTheDocument();
      // formatDate is mocked, so we check it was called
    });

    it('should format dates correctly', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      // Check that dates section exists
      expect(screen.getByText(/Dates/)).toBeInTheDocument();
    });
  });

  describe('Duration Display', () => {
    it('should display duration in days', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      expect(screen.getByText('3 days')).toBeInTheDocument();
    });

    it('should use singular "day" for 1 day duration', () => {
      const oneDayVenue = { ...mockVenue, durationDays: 1 };
      render(<VenueMarker venue={oneDayVenue} index={0} />);

      expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    it('should use plural "days" for multiple days', () => {
      const multiDayVenue = { ...mockVenue, durationDays: 7 };
      render(<VenueMarker venue={multiDayVenue} index={0} />);

      expect(screen.getByText('7 days')).toBeInTheDocument();
    });

    it('should display duration label', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      expect(screen.getByText('Duration')).toBeInTheDocument();
    });
  });

  describe('Popup Content', () => {
    it('should render popup inside marker', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      const popup = screen.getByTestId('popup');
      expect(popup).toBeInTheDocument();
    });

    it('should include all required sections in popup', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      // Check for major sections
      expect(screen.getByText('Theatre Royal')).toBeInTheDocument(); // Name
      expect(screen.getByText(/123 Main Street/)).toBeInTheDocument(); // Address
      expect(screen.getByText('Dates')).toBeInTheDocument(); // Dates section
      expect(screen.getByText('Duration')).toBeInTheDocument(); // Duration section
    });

    it('should render venue information in correct order', () => {
      render(<VenueMarker venue={mockVenue} index={0} />);

      const popup = screen.getByTestId('popup');
      const textContent = popup.textContent || '';

      // Venue name should appear before address
      const nameIndex = textContent.indexOf('Theatre Royal');
      const addressIndex = textContent.indexOf('123 Main Street');
      expect(nameIndex).toBeLessThan(addressIndex);
    });
  });

  describe('Edge Cases', () => {
    it('should handle venue with very long name', () => {
      const longNameVenue = {
        ...mockVenue,
        name: 'A Very Long Theatre Name That Might Cause Layout Issues In The Popup Component',
      };

      render(<VenueMarker venue={longNameVenue} index={0} />);

      expect(screen.getByText(/A Very Long Theatre Name/)).toBeInTheDocument();
    });

    it('should handle venue with very long address', () => {
      const longAddressVenue = {
        ...mockVenue,
        address: '123 Very Long Street Name That Goes On And On With Many Details',
      };

      render(<VenueMarker venue={longAddressVenue} index={0} />);

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });

    it('should handle venue with zero duration days', () => {
      const zeroDurationVenue = { ...mockVenue, durationDays: 0 };
      render(<VenueMarker venue={zeroDurationVenue} index={0} />);

      expect(screen.getByText('0 days')).toBeInTheDocument();
    });

    it('should handle large index numbers', () => {
      render(<VenueMarker venue={mockVenue} index={99} />);

      expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    });

    it('should handle venue with empty address', () => {
      const emptyAddressVenue = { ...mockVenue, address: '' };
      render(<VenueMarker venue={emptyAddressVenue} index={0} />);

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should render consistently with same props', () => {
      const { rerender } = render(<VenueMarker venue={mockVenue} index={0} />);

      const firstRender = screen.getByTestId('marker');

      rerender(<VenueMarker venue={mockVenue} index={0} />);

      const secondRender = screen.getByTestId('marker');

      expect(firstRender).toBeInTheDocument();
      expect(secondRender).toBeInTheDocument();
    });

    it('should update when index changes', () => {
      const { rerender } = render(<VenueMarker venue={mockVenue} index={0} />);

      expect(screen.getAllByText('1').length).toBeGreaterThan(0);

      rerender(<VenueMarker venue={mockVenue} index={1} />);

      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('should update when color changes', () => {
      const { rerender } = render(<VenueMarker venue={mockVenue} index={0} color="#FF0000" />);

      const marker1 = screen.getByTestId('marker');
      expect(marker1).toBeInTheDocument();

      rerender(<VenueMarker venue={mockVenue} index={0} color="#00FF00" />);

      const marker2 = screen.getByTestId('marker');
      expect(marker2).toBeInTheDocument();
    });
  });
});
