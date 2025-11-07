import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the services
vi.mock('./services/ai', () => ({
  AIService: vi.fn().mockImplementation(() => ({
    extractTourData: vi.fn(),
  })),
}));

vi.mock('./services/geocoding', () => ({
  GeocodingService: vi.fn().mockImplementation(() => ({
    geocode: vi.fn(),
    delay: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('./services/distance', () => ({
  DistanceService: {
    calculateRoutes: vi.fn().mockReturnValue([]),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Initial Rendering', () => {
    it('should render the app header', () => {
      render(<App />);

      expect(screen.getByText(/MorganMap/)).toBeInTheDocument();
      expect(screen.getByText(/AI-Powered Theatre Tour Mapping/)).toBeInTheDocument();
    });

    it('should render the footer', () => {
      render(<App />);

      expect(screen.getByText(/MorganMap - Theatre Tour Mapping Application/)).toBeInTheDocument();
      expect(screen.getByText(/Powered by AI & OpenStreetMap/)).toBeInTheDocument();
    });

    it('should render TourInput initially', () => {
      render(<App />);

      expect(screen.getByText('Extract Tour Information')).toBeInTheDocument();
      expect(screen.getByLabelText('Tour URL input')).toBeInTheDocument();
    });

    it('should render instructions section', () => {
      render(<App />);

      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });

    it('should not render map initially', () => {
      render(<App />);

      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
    });

    it('should not render TourDetails initially', () => {
      render(<App />);

      expect(screen.queryByText('No Tour Selected')).not.toBeInTheDocument();
    });
  });

  describe('Tour Extraction Flow', () => {
    it('should show loading state when extracting tour', async () => {
      const user = userEvent.setup();

      // Mock fetch to never resolve, keeping loading state
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Fetching webpage content/)).toBeInTheDocument();
      });
    });

    it('should handle successful tour extraction', async () => {
      const user = userEvent.setup();

      // Mock successful responses
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: '<html>Tour content</html>' }),
      });

      const mockExtractedData = {
        name: 'Test Tour',
        description: 'Test Description',
        venues: [
          {
            id: 'v1',
            name: 'Theatre 1',
            address: '123 Test St',
            city: 'London',
            country: 'UK',
            startDate: '2024-01-15',
            endDate: '2024-01-18',
            durationDays: 3,
          },
        ],
      };

      const { AIService } = await import('./services/ai');
      const { GeocodingService } = await import('./services/geocoding');

      const mockAIInstance = new (AIService as any)();
      mockAIInstance.extractTourData.mockResolvedValue(mockExtractedData);

      const mockGeoInstance = new (GeocodingService as any)();
      mockGeoInstance.geocode.mockResolvedValue({
        success: true,
        latitude: 51.5074,
        longitude: -0.1278,
      });

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Fetching webpage content/)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle fetch error', async () => {
      const user = userEvent.setup();

      // Mock failed fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ error: 'Page not found' }),
      });

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Page not found/)).toBeInTheDocument();
      });
    });

    it('should handle AI extraction error', async () => {
      const user = userEvent.setup();

      // Mock successful fetch but AI error
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: '<html>Tour content</html>' }),
      });

      const { AIService } = await import('./services/ai');
      const mockAIInstance = new (AIService as any)();
      mockAIInstance.extractTourData.mockRejectedValue(new Error('AI extraction failed'));

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/AI extraction failed/)).toBeInTheDocument();
      });
    });

    it('should handle no venues found', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: '<html>Tour content</html>' }),
      });

      const { AIService } = await import('./services/ai');
      const mockAIInstance = new (AIService as any)();
      mockAIInstance.extractTourData.mockResolvedValue({
        name: 'Test Tour',
        venues: [],
      });

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/No venues found/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading Messages', () => {
    it('should update loading message during extraction', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: '<html>Tour content</html>' }),
      });

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      // Should show fetching message
      await waitFor(() => {
        expect(screen.getByText(/Fetching webpage content/)).toBeInTheDocument();
      });
    });
  });

  describe('Map and Tour Display', () => {
    it('should not show map when no tour is loaded', () => {
      render(<App />);

      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
    });

    it('should show instructions when no tour is loaded', () => {
      render(<App />);

      expect(screen.getByText('How It Works')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error in TourInput component', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
        json: async () => ({ error: 'Internal Server Error' }),
      });

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Internal Server Error/)).toBeInTheDocument();
      });
    });

    it('should clear error on successful extraction attempt', async () => {
      const user = userEvent.setup();

      // First attempt fails
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error 1' }),
      });

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Error 1/)).toBeInTheDocument();
      });

      // Second attempt with different mock
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      await user.clear(input);
      await user.type(input, 'https://example.com/tour2');
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText(/Error 1/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have main role on main content', () => {
      render(<App />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<App />);

      // Main heading
      expect(screen.getByText(/MorganMap/)).toBeInTheDocument();
    });

    it('should have loading state with proper ARIA', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        const statusElement = screen.getByRole('status');
        expect(statusElement).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should integrate TourInput and error handling', () => {
      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button');

      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      render(<App />);

      // Should have header, main, and footer
      expect(screen.getByText(/MorganMap/)).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText(/Powered by AI & OpenStreetMap/)).toBeInTheDocument();
    });
  });

  describe('Configuration', () => {
    it('should use backend URL from config', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: '<html>content</html>' }),
      });

      const { AIService } = await import('./services/ai');
      const mockAIInstance = new (AIService as any)();
      mockAIInstance.extractTourData.mockResolvedValue({
        name: 'Tour',
        venues: [],
      });

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check that fetch was called with backend URL
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('/api/fetch-url');
    });
  });

  describe('URL Validation', () => {
    it('should validate URL format before submission', async () => {
      const user = userEvent.setup();
      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'not-a-valid-url');
      await user.click(button);

      expect(screen.getByText(/Please enter a valid URL/)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should accept valid HTTP URLs', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'http://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should accept valid HTTPS URLs', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(<App />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});
