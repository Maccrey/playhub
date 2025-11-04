'use client';

import {useState, useCallback} from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import {updateUserHighScore} from '@/lib/firestore';

const INSTRUCTION_KEY = 'guess-the-number';
const INITIAL_MESSAGE = 'Guess a number between 1 and 100';

const createTargetNumber = () => Math.floor(Math.random() * 100) + 1;

const GuessTheNumber = ({onGameEnd}: {onGameEnd: (score: number) => void}) => {
  const [targetNumber, setTargetNumber] = useState(createTargetNumber);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState(INITIAL_MESSAGE);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const {user} = useUserStore();

  const resetGame = useCallback(() => {
    setTargetNumber(createTargetNumber());
    setGuess('');
    setMessage(INITIAL_MESSAGE);
    setAttempts(0);
    setGameOver(false);
  }, []);

  const handleGuess = (event: React.FormEvent) => {
    event.preventDefault();
    if (gameOver) return;

    const numericGuess = Number(guess);
    if (!Number.isFinite(numericGuess) || numericGuess <= 0) {
      setMessage('Please enter a valid number');
      return;
    }

    const attemptCount = attempts + 1;
    setAttempts(attemptCount);

    if (numericGuess === targetNumber) {
      setMessage(`You got it in ${attemptCount} attempts!`);
      setGameOver(true);
      const score = Math.max(0, 100 - attemptCount);
      onGameEnd(score);
    } else if (numericGuess < targetNumber) {
      setMessage('Too low!');
    } else {
      setMessage('Too high!');
    }

    setGuess('');
  };

  const handleRestart = () => {
    resetGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      const score = Math.max(0, 100 - attempts);
      updateUserHighScore(user.uid, 'guess-the-number', score);
      alert('Score saved!');
    } else if (!user) {
      alert('You must be logged in to save your score.');
    } else {
      alert('You must finish the game to save your score.');
    }
  };

  const handleShowInstructions = () => {
    setShowInstructions((prev) => !prev);
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
      {!gameOver && (
        <form onSubmit={handleGuess} className="flex space-x-2">
          <input
            type="number"
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            className="px-4 py-2 border rounded-md"
            autoFocus
          />
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">
            Guess
          </button>
        </form>
      )}
    </div>
  );
};

export default GuessTheNumber;
