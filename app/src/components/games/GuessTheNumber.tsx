

import { useState, useEffect } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const INSTRUCTION_KEY = 'guess-the-number';

const GuessTheNumber = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Guess a number between 1 and 100');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    const initializeGame = () => {
      setTargetNumber(Math.floor(Math.random() * 100) + 1);
      setGuess('');
      setMessage('Guess a number between 1 and 100');
      setAttempts(0);
      setGameOver(false);
    };
    initializeGame();
  }, []);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameOver) return;

    const numGuess = parseInt(guess, 10);
    if (isNaN(numGuess)) {
      setMessage('Please enter a valid number');
      return;
    }

    setAttempts(attempts + 1);

    if (numGuess === targetNumber) {
      setMessage(`You got it in ${attempts + 1} attempts!`);
      setGameOver(true);
      const score = 100 - (attempts + 1);
      onGameEnd(score);
    } else if (numGuess < targetNumber) {
      setMessage('Too low!');
    } else {
      setMessage('Too high!');
    }
    setGuess('');
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      // Lower attempts is a better score
      const score = 100 - attempts;
      updateUserHighScore(user.uid, 'guess-the-number', score);
      alert('Score saved!');
    } else if (!user) {
      alert('You must be logged in to save your score.');
    } else {
      alert('You must finish the game to save your score.');
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
      <div className="text-xl mb-4">{message}</div>
      {!gameOver && (
        <form onSubmit={handleGuess} className="flex space-x-2">
          <input 
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="px-4 py-2 border rounded-md"
            autoFocus
          />
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">Guess</button>
        </form>
      )}
    </div>
  );
};

export default GuessTheNumber;
