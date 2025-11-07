import React, { useState } from 'react';

interface LegendProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  collapsible?: boolean;
}

/**
 * Legend Component
 *
 * Displays a map legend explaining color coding and symbols used in the tour map.
 * Shows venue marker colors, route lines, and other visual indicators.
 *
 * @param position - Position of the legend on the map (default: 'top-right')
 * @param collapsible - Whether the legend can be collapsed/expanded (default: true)
 */
export const Legend: React.FC<LegendProps> = ({
  position = 'top-right',
  collapsible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Venue marker colors matching VenueMarker.tsx
  const venueColors = [
    { name: 'Venue 1', hex: '#FF6B6B' },
    { name: 'Venue 2', hex: '#4ECDC4' },
    { name: 'Venue 3', hex: '#45B7D1' },
    { name: 'Venue 4', hex: '#FFA07A' },
    { name: 'Venue 5', hex: '#98D8C8' },
    { name: 'Venue 6', hex: '#F7DC6F' },
    { name: 'Venue 7', hex: '#BB8FCE' },
    { name: 'Venue 8', hex: '#85C1E2' },
    { name: 'Venue 9', hex: '#F8B88B' },
    { name: 'Venue 10', hex: '#52B788' },
  ];

  // Position classes for fixed positioning
  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[400] pointer-events-auto`}
    >
      {/* Legend Container */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Legend</h3>
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse legend' : 'Expand legend'}
            >
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  isExpanded ? '' : '-rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Legend Content */}
        {isExpanded && (
          <div className="px-4 py-3 space-y-4 min-w-64">
            {/* Venue Markers Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Venue Markers
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                Numbered circles represent venues in tour order
              </p>
              <div className="grid grid-cols-2 gap-2">
                {venueColors.slice(0, 6).map((color) => (
                  <div key={color.hex} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 border border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-gray-700">{color.name}</span>
                  </div>
                ))}
              </div>
              {venueColors.length > 6 && (
                <p className="text-xs text-gray-500 mt-2">
                  + {venueColors.length - 6} more colors
                </p>
              )}
            </div>

            {/* Route Lines Section */}
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Route Lines
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-blue-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Travel routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-blue-300 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Route distance</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                Click on any venue marker to see detailed information including
                dates, duration, and location.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legend;
