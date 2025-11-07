import React from 'react';

interface LoadingStateProps {
  /**
   * Optional status message to display below the spinner.
   * Examples: "Extracting tour data...", "Geocoding venues...", "Processing..."
   * @default "Loading..."
   */
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-dots {
          0%, 60%, 100% { transform: translateY(0); opacity: 1; }
          30% { transform: translateY(-10px); opacity: 0.7; }
        }
        .animate-spinner {
          animation: spin 1s linear infinite;
        }
        .animate-bounce-dots {
          animation: bounce-dots 1.4s infinite;
        }
      `}</style>

      <div className="bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center gap-6 max-w-sm mx-4">
        {/* Animated Spinner Ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spinner"></div>
        </div>

        {/* Status Message */}
        <p className="text-gray-700 font-semibold text-center text-base leading-relaxed">
          {message}
        </p>

        {/* Loading Indicator Dots */}
        <div className="flex gap-2 justify-center">
          <div
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce-dots"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce-dots"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce-dots"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
