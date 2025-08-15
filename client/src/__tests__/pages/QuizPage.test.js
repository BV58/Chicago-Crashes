import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizPage from '../../pages/QuizPage';

global.fetch = jest.fn();

const mockQuizData = [
  [{ city_name: 'Chicago' }, { city_name: 'Aurora' }, { city_name: 'Rockford' }, { city_name: 'Peoria' }],
  [{ vehicle_age: 'Under 5' }, { vehicle_age: '5-10' }, { vehicle_age: '10-25' }, { vehicle_age: '25+' }],
  [{ age_group: '25-64' }, { age_group: 'Under 25' }, { age_group: '65+' }],
  [{ weather_condition: 'Clear' }, { weather_condition: 'Rain' }, { weather_condition: 'Snow' }, { weather_condition: 'Fog' }],
  [{ crash_type: 'Rear End', fatality_rate_pct: 5.2 }, { crash_type: 'Side Impact', fatality_rate_pct: 3.1 }, { crash_type: 'Head On', fatality_rate_pct: 8.5 }, { crash_type: 'Rollover', fatality_rate_pct: 12.3 }]
];

describe('QuizPage', () => {
  beforeEach(() => {
    let callCount = 0;
    fetch.mockImplementation((url) => {
      const response = mockQuizData[callCount] || [];
      callCount++;
      return Promise.resolve({
        json: () => Promise.resolve(response)
      });
    });
  });

  afterEach(() => {
    fetch.mockClear();
  });

  test('shows loading initially', () => {
    render(<QuizPage />);
    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  test('renders quiz questions after loading', async () => {
    await act(async () => {
      render(<QuizPage />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading quiz...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/)).toBeInTheDocument();
    });
  });

  test('handles answer selection and moves to next question', async () => {
    await act(async () => {
      render(<QuizPage />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading quiz...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      const answerButtons = screen.getAllByRole('button');
      const firstAnswer = answerButtons.find(btn => btn.textContent !== 'Restart Quiz');
      if (firstAnswer) {
        fireEvent.click(firstAnswer);
      }
    });
  });

  test('shows final score after completing quiz', async () => {
    await act(async () => {
      render(<QuizPage />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading quiz...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Answer all questions
    for (let i = 0; i < 5; i++) {
      await waitFor(() => {
        const answerButtons = screen.getAllByRole('button');
        const firstAnswer = answerButtons.find(btn => 
          btn.textContent !== 'Restart Quiz' && 
          !btn.textContent.includes('Quiz Completed')
        );
        if (firstAnswer) {
          fireEvent.click(firstAnswer);
        }
      });
    }
    
    await waitFor(() => {
      expect(screen.getByText('Quiz Completed!')).toBeInTheDocument();
      expect(screen.getByText(/Your score:/)).toBeInTheDocument();
    });
  });

  test('handles quiz restart', async () => {
    await act(async () => {
      render(<QuizPage />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading quiz...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Complete quiz first
    for (let i = 0; i < 5; i++) {
      await waitFor(() => {
        const answerButtons = screen.getAllByRole('button');
        const firstAnswer = answerButtons.find(btn => 
          btn.textContent !== 'Restart Quiz' && 
          !btn.textContent.includes('Quiz Completed')
        );
        if (firstAnswer) {
          fireEvent.click(firstAnswer);
        }
      });
    }
    
    await waitFor(() => {
      const restartButton = screen.getByText('Restart Quiz');
      fireEvent.click(restartButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of/)).toBeInTheDocument();
    });
  });

  test('displays question progress', async () => {
    await act(async () => {
      render(<QuizPage />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading quiz...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
    });
  });
});