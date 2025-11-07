import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
import { Route } from '../types/tour';

interface RouteLineProps {
  routes: Route[];
}

/**
 * Generates a color in hex format based on a progress value (0-1)
 * Uses a gradient from blue (#0066FF) at the start to red (#FF0000) at the end
 * This provides a visual indication of tour progression
 */
function getGradientColor(progress: number): string {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Start color: blue (0, 102, 255)
  const startR = 0;
  const startG = 102;
  const startB = 255;

  // End color: red (255, 0, 0)
  const endR = 255;
  const endG = 0;
  const endB = 0;

  // Linear interpolation between start and end colors
  const r = Math.round(startR + (endR - startR) * clampedProgress);
  const g = Math.round(startG + (endG - startG) * clampedProgress);
  const b = Math.round(startB + (endB - startB) * clampedProgress);

  // Convert RGB to hex format
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * RouteLines Component
 *
 * Renders colored polylines connecting consecutive tour venues with distance tooltips.
 * The lines use a gradient color scheme that transitions from blue (tour start) to red (tour end),
 * providing a visual indication of the tour's progression.
 *
 * Features:
 * - Color-coded lines based on tour progression (blue → red gradient)
 * - Smooth, anti-aliased lines for a polished appearance
 * - Distance information displayed in both kilometers and miles
 * - Venue names shown in tooltips on hover
 * - Optimized opacity for visual clarity over map tiles
 *
 * @param routes - Array of Route objects containing venue coordinates and distance information
 */
export const RouteLines: React.FC<RouteLineProps> = ({ routes }) => {
  return (
    <>
      {routes.map((route, index) => {
        // Calculate progress as a value from 0 (start) to 1 (end)
        // This determines the position in the color gradient
        const progress = routes.length > 1 ? index / (routes.length - 1) : 0;
        const color = getGradientColor(progress);

        // Create position array for polyline in [lat, lng] format
        const positions: [number, number][] = [
          [route.from.latitude, route.from.longitude],
          [route.to.latitude, route.to.longitude],
        ];

        // Format distance text for tooltip display
        const distanceText = `${route.distanceKm.toFixed(1)} km / ${route.distanceMiles.toFixed(1)} mi`;

        return (
          <Polyline
            key={`route-${index}`}
            positions={positions}
            color={color}
            weight={3}
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
            smoothFactor={1.0}
          >
            <Tooltip
              direction="center"
              offset={[0, 0]}
              opacity={0.9}
              permanent={false}
              className="route-tooltip"
            >
              <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                <strong>{route.from.name} → {route.to.name}</strong>
                <br />
                <span>{distanceText}</span>
              </div>
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
};

export default RouteLines;
