# Testing Guide for MorganMap

This document describes the test setup and how to run tests for the MorganMap frontend application.

## Test Framework

The project uses the following testing tools:

- **Vitest**: A fast unit test framework for Vite projects
- **React Testing Library**: For testing React components with user-centric queries
- **jsdom**: Browser environment simulation for Node.js
- **@testing-library/user-event**: For simulating user interactions
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

## Test Structure

Tests are organized alongside the source code:

```
src/
├── components/
│   ├── TourInput.tsx
│   ├── TourInput.test.tsx
│   ├── MapView.tsx
│   ├── MapView.test.tsx
│   ├── VenueMarker.tsx
│   ├── VenueMarker.test.tsx
│   ├── TourDetails.tsx
│   └── TourDetails.test.tsx
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
├── test/
│   └── setup.ts           # Test configuration and mocks
├── App.tsx
└── App.test.tsx
```

## Running Tests

### Run all tests once

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test -- --watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

### Run tests with UI

```bash
npm run test:ui
```

This opens an interactive UI in your browser to view and run tests.

## Test Coverage

The project is configured with coverage thresholds:

- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

Coverage reports are generated in three formats:
- **Text**: Displayed in the terminal
- **HTML**: Available in `coverage/index.html`
- **JSON**: Available in `coverage/coverage-final.json`

## Test Files Overview

### Component Tests

#### TourInput.test.tsx
Tests for the tour URL input component:
- URL validation (HTTP/HTTPS)
- Empty URL handling
- Invalid URL error messages
- Button state changes (enabled/disabled)
- Loading states
- Error display from props
- Keyboard interactions (Enter key)
- Input clearing on success
- Accessibility (ARIA labels)

#### MapView.test.tsx
Tests for the Leaflet map component:
- Map container rendering
- TileLayer rendering
- Custom className application
- Bounds adjustment for venues
- MapRef handling
- Edge cases (empty venues, extreme coordinates)

#### VenueMarker.test.tsx
Tests for individual venue markers:
- Marker rendering with venue information
- Popup content display
- Venue name and address formatting
- Date formatting integration
- Duration display (singular/plural)
- Index numbering
- Color cycling for multiple venues
- Custom color support
- Edge cases (long names, zero duration)

#### TourDetails.test.tsx
Tests for the tour sidebar:
- Empty state display
- Tour header (name, description)
- Statistics display (venues, days, distance)
- Venue list rendering
- Venue click handling and selection
- Route summary
- Distance calculations
- Edge cases (zero venues, long names)

#### App.test.tsx
Integration tests for the main application:
- Initial rendering (header, footer, input)
- Tour extraction flow
- Loading states and messages
- Error handling (fetch errors, AI errors)
- URL validation integration
- Component integration
- Configuration (backend URL)
- Accessibility

### Utility Tests

#### helpers.test.ts
Tests for utility functions:
- `formatDate`: Date string formatting
- `isValidType`: Type validation
- `hasRequiredProps`: Object property validation

## Mocks

The test setup includes mocks for external dependencies:

### Leaflet
- `divIcon`: Marker icon creation
- `LatLngBounds`: Map bounds
- Map, Marker, TileLayer, Popup components

### React-Leaflet
- `MapContainer`: Map container component
- `TileLayer`: Base map tiles
- `Marker`: Venue markers
- `Popup`: Info popups
- `Polyline`: Route lines
- `useMap`: Hook to access map instance

### Global Mocks
- `window.matchMedia`: For responsive design tests
- `fetch`: For API call mocking in tests

## Writing New Tests

When adding new tests, follow these guidelines:

1. **Use descriptive test names**: Tests should clearly state what they're testing
2. **Arrange-Act-Assert pattern**: Set up, execute, verify
3. **Use user-centric queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Test behavior, not implementation**: Focus on what users see and do
5. **Mock external dependencies**: Use the mocks defined in `setup.ts`
6. **Clean up**: Mocks are automatically cleared between tests

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should handle user click', async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();

    render(<MyComponent onClick={onClickMock} />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
```

## Troubleshooting

### Tests failing with "act" warnings

These warnings occur when state updates happen outside of React's awareness. They are usually safe to ignore in tests but can be resolved by:
- Using `waitFor` from Testing Library
- Ensuring async operations complete before assertions
- Using `user-event` instead of `fireEvent`

### Mocked modules not working

If mocks aren't working:
1. Check that the module path in `vi.mock()` matches the import
2. Ensure mocks are defined before the component imports
3. Clear mocks between tests with `vi.clearAllMocks()`

### Coverage not meeting thresholds

If coverage is below 70%:
1. Check which files are uncovered: `npm run test:coverage`
2. Add tests for the specific uncovered lines
3. Consider if the code is actually testable (may need refactoring)

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Run tests with coverage
  run: npm run test:coverage
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
