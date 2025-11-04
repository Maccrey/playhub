
'use client';

import { useState, useEffect } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

// Simplified Chess Board (e.g., 3x3 or 4x4 for mini-chess)
// P: Pawn, R: Rook, N: Knight, B: Bishop, Q: Queen, K: King
// Lowercase for black pieces, Uppercase for white pieces
const initialBoard = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const INSTRUCTION_KEY = 'mini-chess';

const MiniChess = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [board, setBoard] = useState<(string | null)[][]>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<{ r: number; c: number } | null>(null);
  const [turn, setTurn] = useState('white'); // 'white' or 'black'
  const [message, setMessage] = useState('White to move');
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const handleShowInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Simplified move validation (very basic, just for UI interaction)
  const isValidMove = (startR: number, startC: number, endR: number, endC: number) => {
    const piece = board[startR][startC];
    if (!piece) return false;

    const targetPiece = board[endR][endC];
    const isWhitePiece = piece === piece.toUpperCase();
    const isBlackPiece = piece === piece.toLowerCase();

    if (isWhitePiece && turn === 'black') return false;
    if (isBlackPiece && turn === 'white') return false;

    if (targetPiece) {
      const isTargetWhite = targetPiece === targetPiece.toUpperCase();
      const isTargetBlack = targetPiece === targetPiece.toLowerCase();
      if ((isWhitePiece && isTargetWhite) || (isBlackPiece && isTargetBlack)) {
        return false; // Cannot capture own piece
      }
    }

    // Basic pawn movement (forward 1, capture diagonal)
    if (piece.toLowerCase() === 'p') {
      if (isWhitePiece) {
        if (endR === startR - 1 && endC === startC && !targetPiece) return true; // Move forward
        if (endR === startR - 1 && Math.abs(endC - startC) === 1 && targetPiece) return true; // Capture
      } else { // Black pawn
        if (endR === startR + 1 && endC === startC && !targetPiece) return true; // Move forward
        if (endR === startR + 1 && Math.abs(endC - startC) === 1 && targetPiece) return true; // Capture
      }
    }

    // Very basic King movement (1 square in any direction)
    if (piece.toLowerCase() === 'k') {
      if (Math.abs(startR - endR) <= 1 && Math.abs(startC - endC) <= 1) return true;
    }

    // For other pieces, just allow any move for now (very simplified)
    return true;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (gameOver) return;

    if (selectedPiece) {
      // A piece is already selected, try to move it
      const { r: startR, c: startC } = selectedPiece;
      if (isValidMove(startR, startC, r, c)) {
        const newBoard = board.map(row => [...row]);
        const capturedPiece = newBoard[r][c];
        newBoard[r][c] = newBoard[startR][startC];
        newBoard[startR][startC] = null;
        setBoard(newBoard);
        setSelectedPiece(null);

        if (capturedPiece && capturedPiece.toLowerCase() === 'k') {
          setGameOver(true);
          setMessage(`${turn === 'white' ? 'White' : 'Black'} wins!`);
          onGameEnd(1);
        } else {
          setTurn(turn === 'white' ? 'black' : 'white');
          setMessage(`${turn === 'white' ? 'Black' : 'White'} to move`);
        }
        // TODO: Check for checkmate/stalemate
      } else {
        setMessage('Invalid move. Try again.');
        setSelectedPiece(null);
      }
    } else {
      // No piece selected, try to select one
      const piece = board[r][c];
      if (piece) {
        const isWhitePiece = piece === piece.toUpperCase();
        if ((isWhitePiece && turn === 'white') || (!isWhitePiece && turn === 'black')) {
          setSelectedPiece({ r, c });
          setMessage(`Selected ${piece} at (${r},${c})`);
        } else {
          setMessage('It\'s not your turn to move that piece.');
        }
      } else {
        setMessage('No piece selected.');
      }
    }
  };

  const handleRestart = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setTurn('white');
    setMessage('White to move');
    setGameOver(false);
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      // Score based on who won, or turns taken
      const score = turn === 'white' ? 100 : 50; // Example scoring
      updateUserHighScore(user.uid, 'mini-chess', score);
      alert('Score saved!');
    } else if (!user) {
      alert('You must be logged in to save your score.');
    } else {
      alert('Finish the game to save your score.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <GameToolbar 
        onRestart={handleRestart} 
        onSaveScore={handleSaveScore} 
        onShowInstructions={handleShowInstructions}
      />
      <GameInstructionsModal
        translationKey={INSTRUCTION_KEY}
        open={showInstructions}
        onClose={handleShowInstructions}
      />
      <div className="text-xl mb-4">{message}</div>
      <div className="grid grid-cols-8 gap-0.5 bg-gray-700 p-1">
        {board.map((row, r) => (
          row.map((piece, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-12 h-12 flex items-center justify-center text-2xl font-bold cursor-pointer
                ${(r + c) % 2 === 0 ? 'bg-gray-300' : 'bg-gray-500'}
                ${selectedPiece?.r === r && selectedPiece?.c === c ? 'ring-4 ring-blue-500' : ''}
              `}
              onClick={() => handleSquareClick(r, c)}
            >
              {piece}
            </div>
          ))
        ))}
      </div>
      {gameOver && (
        <div className="mt-4 text-2xl font-bold text-red-600">
          Game Over!
        </div>
      )}
    </div>
  );
};

export default MiniChess;
