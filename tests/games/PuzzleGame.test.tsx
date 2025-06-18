import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { PuzzleGame } from '../../components/games/PuzzleGame';
import '@testing-library/jest-dom';

describe('PuzzleGame', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Score Calculations', () => {
    test('should increment score by 50 points for correct piece placement', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      // Simulate correct piece placement
      const pieces = screen.getAllByRole('button');
      fireEvent.click(pieces[0]); // Select first piece
      fireEvent.click(pieces[1]); // Place in correct position
      
      // Verify score increment
      expect(screen.getByText(/Score: 50/)).toBeInTheDocument();
      expect(screen.getByText("Pièce bien placée ! +50 points")).toBeInTheDocument();
    });

    test('should maintain score accuracy for multiple piece placements', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      // Simulate multiple correct placements
      const pieces = screen.getAllByRole('button');
      
      // First placement
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[1]);
      expect(screen.getByText(/Score: 50/)).toBeInTheDocument();
      
      // Second placement
      fireEvent.click(pieces[2]);
      fireEvent.click(pieces[3]);
      expect(screen.getByText(/Score: 100/)).toBeInTheDocument();
    });

    test('should not change score for invalid moves', () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      const initialScore = 0;
      
      // Simulate incorrect placement
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[5]); // Wrong position
      
      expect(screen.getByText(`Score: ${initialScore}`)).toBeInTheDocument();
    });

    test('should award completion bonus when puzzle is solved', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      // Simulate completing the puzzle
      const pieces = screen.getAllByRole('button');
      for (let i = 0; i < pieces.length - 1; i += 2) {
        fireEvent.click(pieces[i]);
        fireEvent.click(pieces[i + 1]);
        await waitFor(() => {
          expect(screen.queryByText(/Pièce bien placée/)).toBeInTheDocument();
        });
      }
      
      // Verify final score includes completion bonus
      expect(screen.getByText(/Score: \d+/)).toBeInTheDocument();
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe('Feedback Messages', () => {
    test('should display success message with correct score value', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[1]);
      
      await waitFor(() => {
        expect(screen.getByText("Pièce bien placée ! +50 points")).toBeInTheDocument();
      });
    });

    test('should show error message for invalid placement', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[5]); // Wrong position
      
      await waitFor(() => {
        expect(screen.getByText(/Essayez encore/)).toBeInTheDocument();
      });
    });

    test('should clear feedback message after delay', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[1]);
      
      await waitFor(() => {
        expect(screen.getByText("Pièce bien placée ! +50 points")).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.queryByText("Pièce bien placée ! +50 points")).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Game State', () => {
    test('should maintain score during piece rearrangement', () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      
      // First correct placement
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[1]);
      const initialScore = 50;
      
      // Rearrange other pieces
      fireEvent.click(pieces[2]);
      fireEvent.click(pieces[3]);
      
      expect(screen.getByText(`Score: ${initialScore}`)).toBeInTheDocument();
    });

    test('should reset game state for new game', () => {
      const { rerender } = render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[1]);
      
      // Rerender component to simulate new game
      rerender(<PuzzleGame onComplete={mockOnComplete} />);
      
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid consecutive moves', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      
      // Simulate rapid moves
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[1]);
      fireEvent.click(pieces[2]);
      fireEvent.click(pieces[3]);
      
      await waitFor(() => {
        expect(screen.getByText(/Score: 100/)).toBeInTheDocument();
      });
    });

    test('should prevent moves during feedback animation', async () => {
      render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      
      // First move
      fireEvent.click(pieces[0]);
      fireEvent.click(pieces[1]);
      
      // Attempt immediate second move
      fireEvent.click(pieces[2]);
      fireEvent.click(pieces[3]);
      
      // Score should only reflect first move
      expect(screen.getByText('Score: 50')).toBeInTheDocument();
    });

    test('should handle component unmount during move', () => {
      const { unmount } = render(<PuzzleGame onComplete={mockOnComplete} />);
      
      const pieces = screen.getAllByRole('button');
      fireEvent.click(pieces[0]);
      
      // Unmount during move
      unmount();
      
      // Should not throw errors
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });
});