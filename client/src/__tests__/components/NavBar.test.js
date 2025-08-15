import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import NavBar from '../../components/NavBar';

const NavBarWithRouter = () => (
  <BrowserRouter>
    <NavBar />
  </BrowserRouter>
);

describe('NavBar', () => {
  test('renders all navigation links', () => {
    render(<NavBarWithRouter />);
    expect(screen.getByText('Chicago Crashes')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
  });

  test('renders Chicago flag image', () => {
    render(<NavBarWithRouter />);
    const flag = screen.getByAltText('Chicago Flag');
    expect(flag).toBeInTheDocument();
  });
});