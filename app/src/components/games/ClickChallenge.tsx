
'use client';

import { useState, useEffect, useRef } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const GAME_DURATION = 10; // seconds

const INSTRUCTION_KEY = 'click-challenge';

const ClickChallenge = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUserStore();

  const startGame = () => {
    setClicks(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setGameStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setGameStarted(false);
          setGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleClick = () => {
    if (gameStarted && !gameOver) {
      setClicks(prevClicks => prevClicks + 1);
    }
  };

  const handleRestart = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    startGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      updateUserHighScore(user.uid, 'click-challenge', clicks);
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

  useEffect(() => {
    if (gameOver) {
      onGameEnd(clicks);
    }
  }, [gameOver, clicks, onGameEnd]);

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
      <div className="text-xl mb-4">Clicks: {clicks}</div>
      <div className="text-xl mb-4">Time Left: {timeLeft}s</div>
      <button
        onClick={gameStarted ? handleClick : startGame}
        className={`w-64 h-64 flex items-center justify-center text-white text-3xl font-bold rounded-full 
          ${gameStarted ? 'bg-green-500 active:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'}
          ${gameOver ? 'bg-gray-500 cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={gameOver}
      >
        {gameOver ? 'Game Over!' : (gameStarted ? 'Click Me!' : 'Start Game')}
      </button>
      {gameOver && (
        <div className="mt-4 text-2xl font-bold text-red-600">
          Final Clicks: {clicks}
        </div>
      )}
    </div>
  );
};

export default ClickChallenge;
