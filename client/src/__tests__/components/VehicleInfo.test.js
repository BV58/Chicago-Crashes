import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VehicleInfo from '../../components/VehicleInfo';

const mockVehicle = {
  unit_no: '1',
  vehicle_year: '2020',
  make: 'Toyota',
  license_plate_state: 'IL',
  vehicle_type: 'Passenger',
  unit_type: 'Driver',
  occupant_cnt: '2',
  travel_direction: 'North',
  maneuver: 'Straight',
  first_contact_point: 'Front'
};

describe('VehicleInfo', () => {
  test('renders all vehicle information', () => {
    render(<VehicleInfo vehicle={mockVehicle} />);
    expect(screen.getByText('Vehicle 1')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('IL')).toBeInTheDocument();
    expect(screen.getByText('Passenger')).toBeInTheDocument();
  });
});