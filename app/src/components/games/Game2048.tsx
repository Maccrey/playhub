
'use client';

import { useState, useEffect, useCallback } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const INSTRUCTION_KEY = '2048-game';

const GRID_SIZE = 4;

const generateRandomTile = (board: (number | null)[][]) => {
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === null) {
        emptyCells.push({ r, c });
      }
    }
  }
  if (emptyCells.length === 0) return;

  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
};

const initializeBoard = () => {
  const board: (number | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  generateRandomTile(board);
  generateRandomTile(board);
  return board;
};

const Game2048 = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [board, setBoard] = useState<(number | null)[][]>(initializeBoard);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let newBoard = board.map(row => [...row]);
    let newScore = score;

    const rotateLeft = (b: (number | null)[][]) => {
      const newB: (number | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          newB[r][c] = b[c][GRID_SIZE - 1 - r];
        }
      }
      return newB;
    };

    const rotateRight = (b: (number | null)[][]) => {
      const newB: (number | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          newB[r][c] = b[GRID_SIZE - 1 - c][r];
        }
      }
      return newB;
    };

    const slideAndMerge = (row: (number | null)[]) => {
      const newRow: (number | null)[] = row.filter(tile => tile !== null);
      let merged = false;

      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1] && !merged) {
          newRow[i] = (newRow[i] as number) * 2;
          newScore += newRow[i] as number;
          newRow.splice(i + 1, 1);
          merged = true;
        } else {
          merged = false;
        }
      }

      while (newRow.length < GRID_SIZE) {
        newRow.push(null);
      }
      return newRow;
    };

    const originalBoard = JSON.stringify(newBoard);

    if (direction === 'UP') {
      newBoard = rotateRight(newBoard);
      newBoard = newBoard.map(slideAndMerge);
      newBoard = rotateLeft(newBoard);
    } else if (direction === 'DOWN') {
      newBoard = rotateLeft(newBoard);
      newBoard = newBoard.map(slideAndMerge);
      newBoard = rotateRight(newBoard);
    } else if (direction === 'LEFT') {
      newBoard = newBoard.map(slideAndMerge);
    } else if (direction === 'RIGHT') {
      newBoard = newBoard.map(row => slideAndMerge(row.reverse()).reverse());
    }

    if (JSON.stringify(newBoard) !== originalBoard) {
      generateRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
    }

    // Check for game over
    let isGameOver = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newBoard[r][c] === null) {
          isGameOver = false;
          break;
        }
        // Check for possible merges
        if (r < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r + 1][c]) {
          isGameOver = false;
          break;
        }
        if (c < GRID_SIZE - 1 && newBoard[r][c] === newBoard[r][c + 1]) {
          isGameOver = false;
          break;
        }
      }
      if (!isGameOver) break;
    }
    if (isGameOver) setGameOver(true);

  }, [board, score, gameOver]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const directionMap: Record<string, 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        W: 'UP',
        s: 'DOWN',
        S: 'DOWN',
        a: 'LEFT',
        A: 'LEFT',
        d: 'RIGHT',
        D: 'RIGHT',
      };

      const direction = directionMap[event.key];
      if (!direction) return;

      event.preventDefault();
      move(direction);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [move]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(score);
    }
  }, [gameOver, score, onGameEnd]);

  const handleRestart = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, '2048-game', score);
      alert('Score saved!');
    } else {
      alert('You must be logged in to save your score.');
    }
  };

  const handleShowInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const getTileColor = (value: number | null) => {
    switch (value) {
      case 2: return 'bg-gray-200';
      case 4: return 'bg-gray-300';
      case 8: return 'bg-yellow-200';
      case 16: return 'bg-yellow-300';
      case 32: return 'bg-orange-200';
      case 64: return 'bg-orange-300';
      case 128: return 'bg-red-200';
      case 256: return 'bg-red-300';
      case 512: return 'bg-purple-200';
      case 1024: return 'bg-purple-300';
      case 2048: return 'bg-indigo-500 text-white';
      default: return 'bg-gray-100';
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
      <div className="text-xl mb-4">Score: {score}</div>
      <div className="grid gap-1 p-1 bg-gray-400 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: GRID_SIZE * 100 + (GRID_SIZE - 1) * 4, // 100px tile + 4px gap
          height: GRID_SIZE * 100 + (GRID_SIZE - 1) * 4,
        }}
      >
        {board.flat().map((tile, index) => (
          <div
            key={index}
            className={`w-24 h-24 flex items-center justify-center text-3xl font-bold rounded-md ${getTileColor(tile)}`}
          >
            {tile}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="mt-4 text-2xl font-bold text-red-600">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  );
};

export default Game2048;
