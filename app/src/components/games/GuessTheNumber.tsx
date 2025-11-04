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
  const [attemptHistory, setAttemptHistory] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const {user} = useUserStore();

  const resetGame = useCallback(() => {
    setTargetNumber(createTargetNumber());
    setGuess('');
    setMessage(INITIAL_MESSAGE);
    setAttempts(0);
    setAttemptHistory([]);
    setGameOver(false);
  }, []);

  const handleGuess = (event: React.FormEvent) => {
    event.preventDefault();
    if (gameOver) return;

    const numericGuess = Number(guess);
    if (!Number.isFinite(numericGuess) || numericGuess <= 0 || numericGuess > 100) {
      setMessage('Please enter a number between 1 and 100.');
      return;
    }

    const attemptCount = attempts + 1;
    setAttempts(attemptCount);
    setAttemptHistory((prev) => [...prev, numericGuess]);

    if (numericGuess === targetNumber) {
      setMessage(`${numericGuess} is correct! You got it in ${attemptCount} attempts.`);
      setGameOver(true);
      const score = Math.max(0, 100 - attemptCount);
      onGameEnd(score);
    } else if (numericGuess < targetNumber) {
      setMessage(`${numericGuess} is too low. Guess higher! (Attempt ${attemptCount})`);
    } else {
      setMessage(`${numericGuess} is too high. Guess lower! (Attempt ${attemptCount})`);
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
      <div className="text-xl mb-4" aria-live="polite">{message}</div>
      {attemptHistory.length > 0 && (
        <div className="w-full max-w-sm mb-4 text-sm text-gray-600">
          <div className="font-semibold">Previous guesses</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {attemptHistory.map((value, index) => (
              <li
                key={`${value}-${index}`}
                className="px-2 py-1 rounded bg-gray-200 text-gray-800"
              >
                #{index + 1}: {value}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!gameOver && (
        <form onSubmit={handleGuess} className="flex space-x-2">
          <input
            type="number"
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            className="px-4 py-2 border rounded-md"
            min={1}
            max={100}
            inputMode="numeric"
            autoComplete="off"
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
