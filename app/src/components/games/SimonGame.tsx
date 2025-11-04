
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const COLORS = ['red', 'green', 'blue', 'yellow'];

const INSTRUCTION_KEY = 'simon-game';

const SimonGame = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [level, setLevel] = useState(0);
  const [canClick, setCanClick] = useState(false);
  const [message, setMessage] = useState('Press Start to Play');
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const playSequence = useCallback(() => {
    setCanClick(false);
    setMessage('Watch the sequence!');
    let i = 0;
    const interval = setInterval(() => {
      flashColor(sequence[i]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setCanClick(true);
        setMessage('Repeat the sequence!');
      }
    }, 800);
  }, [sequence]);

  const flashColor = (color: string) => {
    const element = document.getElementById(color);
    if (element) {
      element.classList.add('opacity-50');
      setTimeout(() => {
        element.classList.remove('opacity-50');
      }, 400);
    }
  };

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setLevel(0);
    setGameOver(false);
    setMessage('Starting new game...');
    setTimeout(nextRound, 1000);
  };

  const nextRound = () => {
    const newSequence = [...sequence, COLORS[Math.floor(Math.random() * COLORS.length)]];
    setSequence(newSequence);
    setPlayerSequence([]);
    setLevel(level + 1);
    setTimeout(playSequence, 500);
  };

  const handleColorClick = (color: string) => {
    if (!canClick || gameOver) return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true);
      setMessage(`Game Over! You reached Level ${level}.`);
      setCanClick(false);
      onGameEnd(level);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      setCanClick(false);
      setMessage('Correct! Next level...');
      setTimeout(nextRound, 1000);
    }
  };

  const handleRestart = () => {
    startGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      updateUserHighScore(user.uid, 'simon-game', level);
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
      <div className="text-xl mb-4">Level: {level}</div>
      <div className="grid grid-cols-2 gap-4 w-64 h-64">
        {COLORS.map(color => (
          <button
            key={color}
            id={color}
            className={`w-full h-full rounded-lg ${{
              red: 'bg-red-500',
              green: 'bg-green-500',
              blue: 'bg-blue-500',
              yellow: 'bg-yellow-500',
            }[color]} ${canClick && !gameOver ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={() => handleColorClick(color)}
            disabled={!canClick || gameOver}
          ></button>
        ))}
      </div>
      <p className="mt-4 text-xl font-semibold">{message}</p>
      {level === 0 && !gameOver && (
        <button 
          onClick={startGame}
          className="mt-4 px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700"
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default SimonGame;
