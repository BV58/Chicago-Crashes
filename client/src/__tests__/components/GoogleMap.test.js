import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleMap from '../../components/GoogleMap';

// Mock the Google Maps API
jest.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }) => <div data-testid="api-provider">{children}</div>,
  Map: ({ children }) => <div data-testid="map">{children}</div>,
  AdvancedMarker: () => <div data-testid="marker" />,
  Pin: () => <div data-testid="pin" />
}));

describe('GoogleMap', () => {
  test('renders with default props', () => {
    render(<GoogleMap lat="41.8781" lng="-87.6298" />);
    expect(screen.getByTestId('api-provider')).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByTestId('marker')).toBeInTheDocument();
  });

  test('renders with custom height', () => {
    const { container } = render(<GoogleMap lat="41.8781" lng="-87.6298" height="500px" />);
    const mapContainer = container.firstChild.firstChild; // Get the div with the style
    expect(mapContainer).toHaveStyle({ height: '500px' });
  });
});