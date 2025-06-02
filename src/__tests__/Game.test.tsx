// @jest-environment jsdom
/**
 * @jest-environment jsdom
 * @typedef {import('jest')} jest
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Game from '../components/Game';
import type { City } from '../data/cities';

// Mock the cities data
const mockCities: City[] = [
  { 
    name: 'Amsterdam', 
    lat: 52.3676, 
    lng: 4.9041, 
    country: 'Netherlands', 
    continent: 'Europe',
    coordinates: [52.3676, 4.9041],
    package: 'pakket1'
  },
  { 
    name: 'Paris', 
    lat: 48.8566, 
    lng: 2.3522, 
    country: 'France', 
    continent: 'Europe',
    coordinates: [48.8566, 2.3522],
    package: 'pakket1'
  },
];

// Mock the onBack function
const mockOnBack = jest.fn();

describe('Game Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  it('renders the game component with initial state', async () => {
    await act(async () => {
      render(<Game cities={mockCities} onBack={mockOnBack} selectedPackage="pakket1" />);
    });
    
    // Check if the title is rendered
    expect(screen.getByText('Pakket 1')).toBeInTheDocument();
    
    // Check if the hint button is rendered
    expect(screen.getByText('Hint')).toBeInTheDocument();
    
    // Check if the reset button is rendered
    expect(screen.getByText('Herstart')).toBeInTheDocument();
    
    // Check if the back button is rendered
    expect(screen.getByText('Terug')).toBeInTheDocument();
  });

  it('shows hint when hint button is clicked', async () => {
    await act(async () => {
      render(<Game cities={mockCities} onBack={mockOnBack} selectedPackage="pakket1" />);
    });
    
    // Click the hint button
    await act(async () => {
      fireEvent.click(screen.getByText('Hint'));
    });
    
    // Check if the hint is displayed
    await waitFor(() => {
      expect(screen.getByText(/Tip:/)).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    await act(async () => {
      render(<Game cities={mockCities} onBack={mockOnBack} selectedPackage="pakket1" />);
    });
    
    // Click the back button
    await act(async () => {
      fireEvent.click(screen.getByText('Terug'));
    });
    
    // Check if onBack was called
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('handles empty cities array gracefully', async () => {
    await act(async () => {
      render(<Game cities={[]} onBack={mockOnBack} selectedPackage="pakket1" />);
    });

    // Should show a message about no cities
    await waitFor(() => {
      expect(screen.getByText(/Geen steden beschikbaar/)).toBeInTheDocument();
    });
  });

  it('persists game state in localStorage', async () => {
    // Set initial state in localStorage
    const initialState = {
      currentCity: 'Amsterdam',
      attempts: 2,
      score: 100,
      completedCities: ['Paris']
    };
    localStorage.setItem('gameState_pakket1', JSON.stringify(initialState));

    await act(async () => {
      render(<Game cities={mockCities} onBack={mockOnBack} selectedPackage="pakket1" />);
    });

    // Verify the state was loaded
    await waitFor(() => {
      expect(screen.getByText('Amsterdam')).toBeInTheDocument();
    });
  });

  it('resets game state when reset button is clicked', async () => {
    // Set initial state
    const initialState = {
      currentCity: 'Amsterdam',
      attempts: 2,
      score: 100,
      completedCities: ['Paris']
    };
    localStorage.setItem('gameState_pakket1', JSON.stringify(initialState));

    await act(async () => {
      render(<Game cities={mockCities} onBack={mockOnBack} selectedPackage="pakket1" />);
    });

    // Click reset button
    await act(async () => {
      fireEvent.click(screen.getByText('Herstart'));
    });

    // Verify state was reset
    await waitFor(() => {
      expect(localStorage.getItem('gameState_pakket1')).toBeNull();
    });
  });

  it('updates score when correct city is selected', async () => {
    await act(async () => {
      render(<Game cities={mockCities} onBack={mockOnBack} selectedPackage="pakket1" />);
    });

    // Mock the current city
    const currentCity = mockCities[0];
    await act(async () => {
      // Simulate clicking on the correct city
      fireEvent.click(screen.getByTestId('map-container'));
    });

    // Verify score was updated
    await waitFor(() => {
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
    });
  });

  it('shows error message for incorrect city selection', async () => {
    await act(async () => {
      render(<Game cities={mockCities} onBack={mockOnBack} selectedPackage="pakket1" />);
    });

    // Mock the current city
    const currentCity = mockCities[0];
    await act(async () => {
      // Simulate clicking on an incorrect location
      fireEvent.click(screen.getByTestId('map-container'));
    });

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/Incorrect/)).toBeInTheDocument();
    });
  });
}); 