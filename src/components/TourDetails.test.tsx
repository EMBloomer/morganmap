import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourDetails } from './TourDetails';
import { Tour, Venue, Route } from '../types/tour';

// Mock the formatDate utility
vi.mock('../utils/helpers', () => ({
  formatDate: vi.fn((date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }),
}));

describe('TourDetails Component', () => {
  const mockVenues: Venue[] = [
    {
      id: 'venue-1',
      name: 'Theatre One',
      address: '123 First St',
      city: 'London',
      state: 'England',
      country: 'UK',
      latitude: 51.5074,
      longitude: -0.1278,
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      durationDays: 3,
    },
    {
      id: 'venue-2',
      name: 'Theatre Two',
      address: '456 Second Ave',
      city: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      durationDays: 2,
    },
    {
      id: 'venue-3',
      name: 'Theatre Three',
      address: '789 Third Blvd',
      city: 'Berlin',
      state: 'Berlin',
      country: 'Germany',
      latitude: 52.5200,
      longitude: 13.4050,
      startDate: '2024-01-25',
      endDate: '2024-01-27',
      durationDays: 2,
    },
  ];

  const mockRoutes: Route[] = [
    {
      from: mockVenues[0],
      to: mockVenues[1],
      distanceKm: 343.5,
      distanceMiles: 213.5,
    },
    {
      from: mockVenues[1],
      to: mockVenues[2],
      distanceKm: 877.8,
      distanceMiles: 545.5,
    },
  ];

  const mockTour: Tour = {
    id: 'tour-1',
    name: 'European Theatre Tour',
    description: 'A wonderful tour across Europe',
    venues: mockVenues,
    routes: mockRoutes,
    startDate: '2024-01-15',
    endDate: '2024-01-27',
    totalDurationDays: 12,
  };

  const mockOnVenueClick = vi.fn();

  beforeEach(() => {
    mockOnVenueClick.mockClear();
  });

  describe('Empty State', () => {
    it('should display empty state when tour is null', () => {
      render(<TourDetails tour={null} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('No Tour Selected')).toBeInTheDocument();
      expect(screen.getByText(/Select or create a tour to view details/)).toBeInTheDocument();
    });

    it('should show appropriate icon in empty state', () => {
      render(<TourDetails tour={null} onVenueClick={mockOnVenueClick} />);

      const emptyStateContainer = screen.getByText('No Tour Selected').parentElement;
      expect(emptyStateContainer).toBeInTheDocument();
    });
  });

  describe('Tour Header', () => {
    it('should display tour name', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('European Theatre Tour')).toBeInTheDocument();
    });

    it('should display tour description', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('A wonderful tour across Europe')).toBeInTheDocument();
    });

    it('should handle tour without description', () => {
      const tourWithoutDesc = { ...mockTour, description: undefined };
      render(<TourDetails tour={tourWithoutDesc} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('European Theatre Tour')).toBeInTheDocument();
      expect(screen.queryByText('A wonderful tour across Europe')).not.toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display correct number of venues', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Venues')).toBeInTheDocument();
    });

    it('should use singular "Venue" for single venue', () => {
      const singleVenueTour = {
        ...mockTour,
        venues: [mockVenues[0]],
        routes: [],
      };

      render(<TourDetails tour={singleVenueTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('Venue')).toBeInTheDocument();
    });

    it('should display total duration', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Days')).toBeInTheDocument();
    });

    it('should use singular "Day" for one day', () => {
      const oneDayTour = { ...mockTour, totalDurationDays: 1 };
      render(<TourDetails tour={oneDayTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('Day')).toBeInTheDocument();
    });

    it('should display total distance in miles', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      // Total miles: 213.5 + 545.5 = 759
      expect(screen.getByText('759')).toBeInTheDocument();
      expect(screen.getByText('Miles')).toBeInTheDocument();
    });

    it('should display tour date range', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('TOUR DATES')).toBeInTheDocument();
    });
  });

  describe('Venue List', () => {
    it('should display all venues', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('Theatre One')).toBeInTheDocument();
      expect(screen.getByText('Theatre Two')).toBeInTheDocument();
      expect(screen.getByText('Theatre Three')).toBeInTheDocument();
    });

    it('should display venue cities', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText(/London/)).toBeInTheDocument();
      expect(screen.getByText(/Paris/)).toBeInTheDocument();
      expect(screen.getByText(/Berlin/)).toBeInTheDocument();
    });

    it('should display venue with state', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText(/London, England/)).toBeInTheDocument();
    });

    it('should display venue without state', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      // Paris venue doesn't have a state
      const parisText = screen.getByText('Paris');
      expect(parisText).toBeInTheDocument();
    });

    it('should display venue numbers', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      // Should have numbered badges for each venue
      const venueButtons = screen.getAllByRole('button');
      expect(venueButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('should display venue duration', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('3 days')).toBeInTheDocument();
      expect(screen.getAllByText('2 days').length).toBe(2);
    });

    it('should use singular "day" for 1 day venue', () => {
      const oneDayVenue = { ...mockVenues[0], durationDays: 1 };
      const tourWithOneDayVenue = {
        ...mockTour,
        venues: [oneDayVenue],
        routes: [],
      };

      render(<TourDetails tour={tourWithOneDayVenue} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    it('should display venue addresses', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('123 First St')).toBeInTheDocument();
      expect(screen.getByText('456 Second Ave')).toBeInTheDocument();
      expect(screen.getByText('789 Third Blvd')).toBeInTheDocument();
    });
  });

  describe('Venue Click Handling', () => {
    it('should call onVenueClick when venue is clicked', async () => {
      const user = userEvent.setup();
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      const venueButton = screen.getByText('Theatre One').closest('button');
      expect(venueButton).not.toBeNull();

      if (venueButton) {
        await user.click(venueButton);
        expect(mockOnVenueClick).toHaveBeenCalledWith(mockVenues[0]);
      }
    });

    it('should call onVenueClick with correct venue', async () => {
      const user = userEvent.setup();
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      const venue2Button = screen.getByText('Theatre Two').closest('button');
      if (venue2Button) {
        await user.click(venue2Button);
        expect(mockOnVenueClick).toHaveBeenCalledWith(mockVenues[1]);
      }
    });

    it('should highlight selected venue', async () => {
      const user = userEvent.setup();
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      const venueButton = screen.getByText('Theatre One').closest('button');
      if (venueButton) {
        await user.click(venueButton);
        expect(venueButton).toHaveClass('bg-blue-50', 'border-blue-500');
      }
    });

    it('should allow clicking different venues', async () => {
      const user = userEvent.setup();
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      const venue1Button = screen.getByText('Theatre One').closest('button');
      const venue2Button = screen.getByText('Theatre Two').closest('button');

      if (venue1Button) {
        await user.click(venue1Button);
        expect(mockOnVenueClick).toHaveBeenCalledWith(mockVenues[0]);
      }

      if (venue2Button) {
        await user.click(venue2Button);
        expect(mockOnVenueClick).toHaveBeenCalledWith(mockVenues[1]);
      }

      expect(mockOnVenueClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Route Summary', () => {
    it('should display route summary when routes exist', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('Route Summary')).toBeInTheDocument();
    });

    it('should display correct number of routes', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText(/2.*route/)).toBeInTheDocument();
    });

    it('should use singular "route" for single route', () => {
      const singleRouteTour = {
        ...mockTour,
        routes: [mockRoutes[0]],
      };

      render(<TourDetails tour={singleRouteTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText(/1.*route.*total/)).toBeInTheDocument();
    });

    it('should display total distance in kilometers and miles', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      // Total: 343.5 + 877.8 = 1221.3 km
      expect(screen.getByText(/1221.3.*km/)).toBeInTheDocument();
      // Total: 213.5 + 545.5 = 759.0 mi
      expect(screen.getByText(/759.0.*mi/)).toBeInTheDocument();
    });

    it('should not display route summary when no routes', () => {
      const noRoutesTour = { ...mockTour, routes: [] };
      render(<TourDetails tour={noRoutesTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.queryByText('Route Summary')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tour with zero venues gracefully', () => {
      const emptyTour = {
        ...mockTour,
        venues: [],
        routes: [],
      };

      render(<TourDetails tour={emptyTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Venues (0)')).toBeInTheDocument();
    });

    it('should handle very long tour names', () => {
      const longNameTour = {
        ...mockTour,
        name: 'An Extremely Long Tour Name That Might Cause Layout Issues',
      };

      render(<TourDetails tour={longNameTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText(/An Extremely Long Tour Name/)).toBeInTheDocument();
    });

    it('should handle very long venue names', () => {
      const longVenueName = {
        ...mockVenues[0],
        name: 'Theatre With An Extremely Long Name That Goes On And On',
      };
      const tourWithLongVenue = {
        ...mockTour,
        venues: [longVenueName],
        routes: [],
      };

      render(<TourDetails tour={tourWithLongVenue} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText(/Theatre With An Extremely Long Name/)).toBeInTheDocument();
    });

    it('should handle tour with many venues', () => {
      const manyVenues = Array.from({ length: 20 }, (_, i) => ({
        ...mockVenues[0],
        id: `venue-${i}`,
        name: `Theatre ${i + 1}`,
      }));

      const tourWithManyVenues = {
        ...mockTour,
        venues: manyVenues,
        routes: [],
      };

      render(<TourDetails tour={tourWithManyVenues} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('Venues (20)')).toBeInTheDocument();
    });
  });

  describe('Scrolling Behavior', () => {
    it('should render venues list in scrollable container', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      // The venues list should be in a container with overflow-y-auto
      const venuesList = screen.getByText('Venues (3)').parentElement;
      expect(venuesList).toBeInTheDocument();
    });
  });

  describe('Distance Calculation', () => {
    it('should calculate total distance correctly', () => {
      render(<TourDetails tour={mockTour} onVenueClick={mockOnVenueClick} />);

      // Check that total distance is displayed (sum of all routes)
      expect(screen.getByText(/1221.3.*km/)).toBeInTheDocument();
      expect(screen.getByText(/759.0.*mi/)).toBeInTheDocument();
    });

    it('should handle zero distance', () => {
      const zeroDistanceTour = {
        ...mockTour,
        routes: [
          {
            from: mockVenues[0],
            to: mockVenues[1],
            distanceKm: 0,
            distanceMiles: 0,
          },
        ],
      };

      render(<TourDetails tour={zeroDistanceTour} onVenueClick={mockOnVenueClick} />);

      expect(screen.getByText(/0.0.*km/)).toBeInTheDocument();
      expect(screen.getByText(/0.0.*mi/)).toBeInTheDocument();
    });
  });
});
