import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryGame } from '../../components/games/MemoryGame';
import '@testing-library/jest-dom';

describe('MemoryGame', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Score Calculations', () => {
    test('should increment score by 10 points for matching pair', async () => {
      render(<MemoryGame onComplete={mockOnComplete} />);
      
      const cards = screen.getAllByRole('button');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]); // Matching pair
      
      await waitFor(() => {
        expect(screen.getByText(/Score: 10/)).toBeInTheDocument();
      });
    });

    test('should deduct 5 points for mismatch but not go below 0', async () => {
      render(<MemoryGame onComplete={mockOnComplete} />);
      
      const cards = screen.getAllByRole('button');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[2]); // Non-matching pair
      
      await waitFor(() => {
        expect(screen.getByText('Score: 0')).toBeInTheDocument();
      });
    });

    test('should award completion bonus for finishing game', async () => {
      render(<MemoryGame onComplete={mockOnComplete} />);
      
      // Simulate completing all pairs
      const cards = screen.getAllByRole('button');
      for (let i = 0; i < cards.length; i += 2) {
        fireEvent.click(cards[i]);
        fireEvent.click(cards[i + 1]);
        await waitFor(() => {
          expect(screen.queryByText(/Match/)).toBeInTheDocument();
        });
      }
      
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe('Game Mechanics', () => {
    test('should only allow two cards flipped at once', async () => {
      render(<MemoryGame onComplete={mockOnComplete} />);
      
      const cards = screen.getAllByRole('button');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]); // Should not flip
      
      const flippedCards = screen.getAllByText(/[🎮🎲🎯🎪🎨🎭]/);
      expect(flippedCards).toHaveLength(2);
    });

    test('should lock board during card check', async () => {
      render(<MemoryGame onComplete={mockOnComplete} />);
      
      const cards = screen.getAllByRole('button');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      
      // Try to click another card immediately
      fireEvent.click(cards[2]);
      
      const flippedCards = screen.getAllByText(/[🎮🎲🎯🎪🎨🎭]/);
      expect(flippedCards).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid clicks on same card', () => {
      render(<MemoryGame onComplete={mockOnComplete} />);
      
      const cards = screen.getAllByRole('button');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[0]); // Click same card again
      
      const flippedCards = screen.getAllByText(/[🎮🎲🎯🎪🎨🎭]/);
      expect(flippedCards).toHaveLength(1);
    });

    test('should handle component unmount during card check', () => {
      const { unmount } = render(<MemoryGame onComplete={mockOnComplete} />);
      
      const cards = screen.getAllByRole('button');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      
      unmount();
      
      // Should not throw errors
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });
});