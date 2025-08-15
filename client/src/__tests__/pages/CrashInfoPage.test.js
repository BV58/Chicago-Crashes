import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import CrashInfoPage from '../../pages/CrashInfoPage';

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ crash_id: 'test-crash-id' })
}));

// Mock GoogleMap
jest.mock('../../components/GoogleMap', () => {
  return function MockGoogleMap() {
    return <div data-testid="google-map">Map</div>;
  };
});

global.fetch = jest.fn();

const CrashInfoPageWithRouter = () => (
  <BrowserRouter>
    <CrashInfoPage />
  </BrowserRouter>
);

describe('CrashInfoPage', () => {
  beforeEach(() => {
    fetch.mockImplementation(() => 
      Promise.resolve({
        json: () => Promise.resolve([{
          street_direction: 'N',
          street_no: '123',
          street_name: 'Main St',
          crash_date: '2023-01-01T12:00:00Z',
          crash_type: 'Rear End',
          first_crash_type: 'Vehicle',
          prim_contributory_cause: 'Following too closely',
          sec_contributory_cause: 'None',
          damage: 'Over $1,500',
          posted_speed_limit: '30',
          traffic_control_device: 'Traffic Signal',
          weather_condition: 'Clear',
          lighting_condition: 'Daylight',
          roadway_surface_condition: 'Dry',
          road_defect: 'No Defects',
          latitude: '41.8781',
          longitude: '-87.6298',
          injury_type: 'No Indication of Injury',
          injuries_total: '0',
          injuries_fatal: '0',
          injuries_incapacitating: '0',
          injuries_unknown: '0'
        }])
      })
    );
  });

  test('renders crash information title', async () => {
    await act(async () => {
      render(<CrashInfoPageWithRouter />);
    });
    expect(screen.getByText('Crash Information')).toBeInTheDocument();
  });

  test('renders crash info sections', async () => {
    await act(async () => {
      render(<CrashInfoPageWithRouter />);
    });
    await waitFor(() => {
      expect(screen.getByText('Crash Info')).toBeInTheDocument();
      expect(screen.getByText('Conditions')).toBeInTheDocument();
      expect(screen.getByText('Injuries')).toBeInTheDocument();
    });
  });
});