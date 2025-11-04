

'use client';

import { useState, useRef } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const INSTRUCTION_KEY = 'color-reaction';

const ColorReaction = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [backgroundColor, setBackgroundColor] = useState('bg-gray-500');
  const [message, setMessage] = useState('Wait for green...');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [canClick, setCanClick] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUserStore();

  const startGame = () => {
    setBackgroundColor('bg-gray-500');
    setMessage('Wait for green...');
    setReactionTime(0);
    setGameStarted(true);
    setCanClick(false);

    timeoutRef.current = setTimeout(() => {
      setBackgroundColor('bg-green-500');
      setMessage('Click now!');
      setStartTime(Date.now());
      setCanClick(true);
    }, Math.random() * 3000 + 2000); // Random time between 2-5 seconds
  };

  const handleClick = () => {
    if (!gameStarted) {
      startGame();
      return;
    }

    if (canClick) {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setMessage(`Your reaction time: ${time}ms`);
      setBackgroundColor('bg-blue-500');
      setCanClick(false);
      setGameStarted(false);
      const score = 10000 - time;
      onGameEnd(score);
    } else {
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setMessage('Too early! Click to try again.');
      setBackgroundColor('bg-red-500');
      setGameStarted(false);
    }
  };

  const handleRestart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    startGame();
  };

  const handleSaveScore = () => {
    if (user && reactionTime > 0) {
      // Lower reaction time is a better score, so invert for high score
      const score = 10000 - reactionTime; // Max 10000 for very fast reaction
      updateUserHighScore(user.uid, 'color-reaction', score);
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
      <div
        className={`w-96 h-96 flex items-center justify-center text-white text-3xl font-bold cursor-pointer transition-colors duration-300 ${backgroundColor}`}
        onClick={handleClick}
      >
        {message}
      </div>
      {reactionTime > 0 && (
        <div className="mt-4 text-2xl">Last Reaction: {reactionTime}ms</div>
      )}
    </div>
  );
};

export default ColorReaction;
