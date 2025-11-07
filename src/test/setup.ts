import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Leaflet
vi.mock('leaflet', () => ({
  divIcon: vi.fn((options) => options),
  LatLngBounds: vi.fn((coords) => ({
    coords,
    isValid: vi.fn(() => true),
  })),
  Map: vi.fn(),
  Marker: vi.fn(),
  TileLayer: vi.fn(),
  Popup: vi.fn(),
}));

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'map-container', ...props }, children)
  ),
  TileLayer: vi.fn(() =>
    React.createElement('div', { 'data-testid': 'tile-layer' })
  ),
  Marker: vi.fn(({ children }: any) =>
    React.createElement('div', { 'data-testid': 'marker' }, children)
  ),
  Popup: vi.fn(({ children }: any) =>
    React.createElement('div', { 'data-testid': 'popup' }, children)
  ),
  Polyline: vi.fn(() =>
    React.createElement('div', { 'data-testid': 'polyline' })
  ),
  useMap: vi.fn(() => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
  })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock fetch globally
global.fetch = vi.fn();

// Create a helper to reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
