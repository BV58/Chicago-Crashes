import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import CrashSearchPage from '../../pages/CrashSearchPage';

// Mock DataGrid
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns, loading, onRowClick }) => (
    <div data-testid="data-grid" onClick={() => onRowClick && onRowClick({ row: { crash_id: 'test-id' } })}>
      {loading ? 'Loading...' : `${rows.length} rows`}
    </div>
  )
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

global.fetch = jest.fn();

const CrashSearchPageWithRouter = () => (
  <BrowserRouter>
    <CrashSearchPage />
  </BrowserRouter>
);

const mockSearchData = [
  {
    crash_id: 'test-crash-1',
    posted_speed_limit: 30,
    injuries_total: 2,
    crash_hour: 14,
    weather_condition: 'Clear',
    lighting_condition: 'Daylight',
    first_crash_type: 'Rear End',
    roadway_type: 'City Street',
    surface_condition: 'Dry',
    damage_value: 'Over $1,500'
  }
];

const mockDropdownData = {
  weather: [{ name: 'Clear' }, { name: 'Rain' }],
  lighting: [{ name: 'Daylight' }, { name: 'Dark' }],
  crashType: [{ name: 'Rear End' }, { name: 'Side Impact' }],
  roadway: [{ name: 'City Street' }, { name: 'Highway' }],
  surface: [{ name: 'Dry' }, { name: 'Wet' }],
  damage: [{ name: 'Over $1,500' }, { name: 'Under $1,500' }]
};

describe('CrashSearchPage', () => {
  beforeEach(() => {
    fetch.mockImplementation((url) => {
      if (url.includes('search_crashes')) {
        return Promise.resolve({ json: () => Promise.resolve(mockSearchData) });
      }
      return Promise.resolve({ json: () => Promise.resolve(Object.values(mockDropdownData)[0]) });
    });
    mockNavigate.mockClear();
  });

  test('renders search form elements', async () => {
    await act(async () => {
      render(<CrashSearchPageWithRouter />);
    });
    
    expect(screen.getByText('Search Crashes')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by Crash ID')).toBeInTheDocument();
    expect(screen.getByText('Posted Speed Limit')).toBeInTheDocument();
    expect(screen.getByText('Total Number of Injuries')).toBeInTheDocument();
    expect(screen.getByText('Crash Hour')).toBeInTheDocument();
  });

  test('handles crash ID input', async () => {
    await act(async () => {
      render(<CrashSearchPageWithRouter />);
    });
    
    const crashIdInput = screen.getByLabelText('Search by Crash ID');
    fireEvent.change(crashIdInput, { target: { value: 'test-crash-123' } });
    expect(crashIdInput.value).toBe('test-crash-123');
  });

  test('handles search button click', async () => {
    await act(async () => {
      render(<CrashSearchPageWithRouter />);
    });
    
    await waitFor(() => {
      const searchButton = screen.getByText('Search');
      expect(searchButton).toBeInTheDocument();
    });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('search_crashes'));
    });
  });

  test('handles row click navigation', async () => {
    await act(async () => {
      render(<CrashSearchPageWithRouter />);
    });
    
    await waitFor(() => {
      const dataGrid = screen.getByTestId('data-grid');
      fireEvent.click(dataGrid);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/test-id');
  });

  test('renders results section', async () => {
    await act(async () => {
      render(<CrashSearchPageWithRouter />);
    });
    
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  test('handles slider changes', async () => {
    await act(async () => {
      render(<CrashSearchPageWithRouter />);
    });
    
    const speedSlider = screen.getByText('Posted Speed Limit').parentElement.querySelector('input[type="range"]');
    if (speedSlider) {
      fireEvent.change(speedSlider, { target: { value: '50' } });
    }
  });
});