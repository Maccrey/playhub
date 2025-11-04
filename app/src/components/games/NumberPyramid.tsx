
'use client';

import { useState, useEffect } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const PYRAMID_HEIGHT = 4;

const generatePyramid = () => {
  const pyramid: (number | null)[][] = [];
  for (let i = 0; i < PYRAMID_HEIGHT; i++) {
    pyramid.push(Array(i + 1).fill(null));
  }
  // Fill the bottom row with random numbers
  for (let i = 0; i < PYRAMID_HEIGHT; i++) {
    pyramid[PYRAMID_HEIGHT - 1][i] = Math.floor(Math.random() * 9) + 1;
  }
  return pyramid;
};

const calculatePyramid = (pyramid: (number | null)[][]) => {
  const newPyramid = pyramid.map(row => [...row]);
  for (let r = PYRAMID_HEIGHT - 2; r >= 0; r--) {
    for (let c = 0; c <= r; c++) {
      if (newPyramid[r + 1][c] !== null && newPyramid[r + 1][c + 1] !== null) {
        newPyramid[r][c] = (newPyramid[r + 1][c] as number) + (newPyramid[r + 1][c + 1] as number);
      }
    }
  }
  return newPyramid;
};

const INSTRUCTION_KEY = 'number-pyramid';

const NumberPyramid = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [pyramid, setPyramid] = useState<(number | null)[][]>(generatePyramid);
  const [solvedPyramid, setSolvedPyramid] = useState<(number | null)[][]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Fill in the missing numbers!');
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    setSolvedPyramid(calculatePyramid(pyramid));
  }, [pyramid]);

  const handleCellChange = (r: number, c: number, value: string) => {
    if (gameOver) return;
    const newPyramid = pyramid.map(row => [...row]);
    newPyramid[r][c] = value === '' ? null : parseInt(value);
    setPyramid(newPyramid);
  };

  const handleSubmit = () => {
    if (gameOver) return;
    let correctCount = 0;
    let totalCells = 0;
    for (let r = 0; r < PYRAMID_HEIGHT; r++) {
      for (let c = 0; c <= r; c++) {
        if (pyramid[r][c] !== null) {
          totalCells++;
          if (pyramid[r][c] === solvedPyramid[r][c]) {
            correctCount++;
          }
        }
      }
    }

    if (correctCount === totalCells && totalCells > 0) {
      setMessage('Correct! You solved it!');
      const newScore = score + totalCells;
      setScore(newScore);
      setGameOver(true);
      onGameEnd(newScore);
    } else {
      setMessage('Keep trying!');
      setScore(Math.max(0, score - 1));
    }
  };

  const handleRestart = () => {
    setPyramid(generatePyramid());
    setScore(0);
    setMessage('Fill in the missing numbers!');
    setGameOver(false);
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      updateUserHighScore(user.uid, 'number-pyramid', score);
      alert('Score saved!');
    } else if (!user) {
      alert('You must be logged in to save your score.');
    } else {
      alert('Finish the game to save your score.');
    }
  };

  const handleShowInstructions = () => {
    setShowInstructions(!showInstructions);
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
      <div className="flex flex-col items-center mb-4">
        {pyramid.map((row, r) => (
          <div key={r} className="flex space-x-2 mb-2">
            {row.map((cell, c) => (
              <input
                key={`${r}-${c}`}
                type="number"
                value={cell === null ? '' : cell}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                className="w-16 h-16 text-center text-2xl font-bold border rounded-md"
                disabled={gameOver || (r === PYRAMID_HEIGHT - 1 && cell !== null)} // Disable bottom row after initial fill
              />
            ))}
          </div>
        ))}
      </div>
      <button 
        onClick={handleSubmit}
        className="px-6 py-3 bg-green-500 text-white text-lg rounded-md hover:bg-green-600"
        disabled={gameOver}
      >
        Check Answer
      </button>
      <p className="mt-4 text-xl font-semibold text-center">{message}</p>
      {gameOver && (
        <div className="mt-4 text-2xl font-bold text-red-600">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  );
};

export default NumberPyramid;
