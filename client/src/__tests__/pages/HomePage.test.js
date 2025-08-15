import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../../pages/HomePage';

// Mock fetch
global.fetch = jest.fn();

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

describe('HomePage', () => {
  beforeEach(() => {
    fetch.mockResolvedValue({
      json: () => Promise.resolve([])
    });
  });

  test('renders dashboard title', async () => {
    render(<HomePage />);
    expect(screen.getByText('Chicago Crash Safety Dashboard')).toBeInTheDocument();
  });

  test('renders year selector', async () => {
    render(<HomePage />);
    expect(screen.getByText('Annual Data')).toBeInTheDocument();
  });
});