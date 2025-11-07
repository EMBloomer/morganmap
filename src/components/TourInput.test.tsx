import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TourInput from './TourInput';

describe('TourInput Component', () => {
  const mockOnExtract = vi.fn();

  beforeEach(() => {
    mockOnExtract.mockClear();
  });

  describe('Rendering', () => {
    it('should render the component with all elements', () => {
      render(<TourInput onExtract={mockOnExtract} />);

      expect(screen.getByText('Extract Tour Information')).toBeInTheDocument();
      expect(screen.getByLabelText('Tour URL input')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Extract tour information/i })).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      const customPlaceholder = 'Custom placeholder text';
      render(<TourInput onExtract={mockOnExtract} placeholder={customPlaceholder} />);

      const input = screen.getByLabelText('Tour URL input');
      expect(input).toHaveAttribute('placeholder', customPlaceholder);
    });

    it('should render with default placeholder', () => {
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      expect(input).toHaveAttribute('placeholder', 'Enter tour URL (e.g., https://example.com/tour)');
    });
  });

  describe('URL Validation', () => {
    it('should accept valid HTTP URL', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'http://example.com/tour');
      await user.click(button);

      expect(mockOnExtract).toHaveBeenCalledWith('http://example.com/tour');
    });

    it('should accept valid HTTPS URL', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com/tour');
      await user.click(button);

      expect(mockOnExtract).toHaveBeenCalledWith('https://example.com/tour');
    });

    it('should show error for invalid URL', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'not-a-valid-url');
      await user.click(button);

      expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
      expect(mockOnExtract).not.toHaveBeenCalled();
    });

    it('should show error for empty URL', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const button = screen.getByRole('button', { name: /Extract tour information/i });
      await user.click(button);

      expect(screen.getByText('Please enter a URL')).toBeInTheDocument();
      expect(mockOnExtract).not.toHaveBeenCalled();
    });

    it('should trim whitespace from URL', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, '  https://example.com/tour  ');
      await user.click(button);

      expect(mockOnExtract).toHaveBeenCalledWith('https://example.com/tour');
    });
  });

  describe('Button States', () => {
    it('should disable button when input is empty', () => {
      render(<TourInput onExtract={mockOnExtract} />);

      const button = screen.getByRole('button', { name: /Extract tour information/i });
      expect(button).toBeDisabled();
    });

    it('should enable button when input has value', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      expect(button).toBeDisabled();

      await user.type(input, 'https://example.com');
      expect(button).not.toBeDisabled();
    });

    it('should disable button and input during loading', () => {
      render(<TourInput onExtract={mockOnExtract} loading={true} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extracting tour information/i });

      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
    });

    it('should show loading state with spinner', () => {
      render(<TourInput onExtract={mockOnExtract} loading={true} />);

      expect(screen.getByText('Extracting...')).toBeInTheDocument();
    });

    it('should show normal state when not loading', () => {
      render(<TourInput onExtract={mockOnExtract} loading={false} />);

      expect(screen.getByText('Extract Tour')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error from props', () => {
      const errorMessage = 'Failed to extract tour';
      render(<TourInput onExtract={mockOnExtract} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should clear local error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      // Trigger an error
      await user.click(button);
      expect(screen.getByText('Please enter a URL')).toBeInTheDocument();

      // Start typing
      await user.type(input, 'h');
      expect(screen.queryByText('Please enter a URL')).not.toBeInTheDocument();
    });

    it('should handle onExtract throwing an error', async () => {
      const user = userEvent.setup();
      const errorOnExtract = vi.fn().mockRejectedValue(new Error('Extraction failed'));
      render(<TourInput onExtract={errorOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      const button = screen.getByRole('button', { name: /Extract tour information/i });

      await user.type(input, 'https://example.com');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Extraction failed')).toBeInTheDocument();
      });
    });

    it('should prioritize prop error over local error', () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} error="Prop error" />);

      // This would normally cause a local error, but prop error takes precedence
      expect(screen.getByText('Prop error')).toBeInTheDocument();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should submit on Enter key press', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      await user.type(input, 'https://example.com');
      await user.keyboard('{Enter}');

      expect(mockOnExtract).toHaveBeenCalledWith('https://example.com');
    });

    it('should not submit on Enter when loading', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} loading={true} />);

      const input = screen.getByLabelText('Tour URL input');
      await user.keyboard('{Enter}');

      expect(mockOnExtract).not.toHaveBeenCalled();
    });

    it('should not submit on other key presses', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      await user.type(input, 'https://example.com');
      await user.keyboard('{Space}');

      expect(mockOnExtract).not.toHaveBeenCalled();
    });
  });

  describe('Input Clearing', () => {
    it('should clear input on successful extraction', async () => {
      const user = userEvent.setup();
      mockOnExtract.mockResolvedValue(undefined);
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input') as HTMLInputElement;
      await user.type(input, 'https://example.com');

      const button = screen.getByRole('button', { name: /Extract tour information/i });
      await user.click(button);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should allow user to change input value', async () => {
      const user = userEvent.setup();
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input') as HTMLInputElement;

      await user.type(input, 'https://example.com');
      expect(input.value).toBe('https://example.com');

      await user.clear(input);
      await user.type(input, 'https://different.com');
      expect(input.value).toBe('https://different.com');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<TourInput onExtract={mockOnExtract} />);

      const input = screen.getByLabelText('Tour URL input');
      expect(input).toHaveAttribute('aria-label', 'Tour URL input');
    });

    it('should link error message with input via aria-describedby', () => {
      render(<TourInput onExtract={mockOnExtract} error="Test error" />);

      const input = screen.getByLabelText('Tour URL input');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });

    it('should update button aria-label during loading', () => {
      const { rerender } = render(<TourInput onExtract={mockOnExtract} loading={false} />);

      let button = screen.getByRole('button', { name: /Extract tour information/i });
      expect(button).toHaveAttribute('aria-label', 'Extract tour information');

      rerender(<TourInput onExtract={mockOnExtract} loading={true} />);

      button = screen.getByRole('button', { name: /Extracting tour information/i });
      expect(button).toHaveAttribute('aria-label', 'Extracting tour information');
    });
  });
});
