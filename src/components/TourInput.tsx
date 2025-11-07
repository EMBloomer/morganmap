import React, { useState } from 'react';

/**
 * Props interface for the TourInput component
 */
interface TourInputProps {
  /** Callback function called when the Extract Tour button is clicked */
  onExtract: (url: string) => void | Promise<void>;
  /** Loading state indicating if extraction is in progress */
  loading?: boolean;
  /** Error message to display if extraction failed */
  error?: string | null;
  /** Optional placeholder text for the input field */
  placeholder?: string;
}

/**
 * TourInput Component
 *
 * A React component for collecting and validating a tour URL, then triggering
 * AI-powered extraction. Features URL validation, loading states, and error handling.
 */
const TourInput: React.FC<TourInputProps> = ({
  onExtract,
  loading = false,
  error = null,
  placeholder = 'Enter tour URL (e.g., https://example.com/tour)',
}) => {
  const [url, setUrl] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  /**
   * Validates if the input is a valid URL
   */
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Handles the extract button click
   */
  const handleExtract = async (): Promise<void> => {
    // Clear previous local error
    setLocalError('');

    // Trim whitespace
    const trimmedUrl = url.trim();

    // Check if URL is empty
    if (!trimmedUrl) {
      setLocalError('Please enter a URL');
      return;
    }

    // Validate URL format
    if (!isValidUrl(trimmedUrl)) {
      setLocalError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Call the onExtract callback
    try {
      await onExtract(trimmedUrl);
      // Clear input on successful extraction
      setUrl('');
    } catch (err) {
      // Error should be handled by parent component via error prop
      if (err instanceof Error) {
        setLocalError(err.message);
      }
    }
  };

  /**
   * Handles Enter key press in the input field
   */
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && !loading) {
      handleExtract();
    }
  };

  /**
   * Handles input change
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUrl(event.target.value);
    // Clear local error when user starts typing
    if (localError) {
      setLocalError('');
    }
  };

  // Determine which error to display (prop takes precedence)
  const displayError = error || localError;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Extract Tour Information
          </h2>
          <p className="text-gray-600">
            Paste a tour URL and let AI extract the tour details and information.
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-800 text-sm">{displayError}</p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-4">
          {/* URL Input Field */}
          <div>
            <label htmlFor="tour-url" className="block text-sm font-medium text-gray-700 mb-2">
              Tour URL
            </label>
            <input
              id="tour-url"
              type="url"
              value={url}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={loading}
              className={`w-full px-4 py-3 border rounded-lg font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                displayError
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
              } ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
              aria-label="Tour URL input"
              aria-describedby={displayError ? 'error-message' : undefined}
            />
            <p className="mt-1 text-xs text-gray-500">
              Example: https://www.example-tours.com/tour/paris-city-tour
            </p>
          </div>

          {/* Extract Button */}
          <div className="pt-2">
            <button
              onClick={handleExtract}
              disabled={loading || !url.trim()}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                loading || !url.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
              type="button"
              aria-label={loading ? 'Extracting tour information' : 'Extract tour information'}
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Extract Tour</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Supports most popular tour websites</span>
            </div>
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>AI-powered extraction and analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourInput;
