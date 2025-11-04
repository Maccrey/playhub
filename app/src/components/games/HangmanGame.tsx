
'use client';

import { useState, useEffect, useCallback } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const WORDS = ['REACT', 'JAVASCRIPT', 'NEXTJS', 'FIREBASE', 'TAILWIND'];
const MAX_GUESSES = 6;

const INSTRUCTION_KEY = 'hangman-game';

const HangmanGame = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [wordToGuess, setWordToGuess] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const initializeGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    setWordToGuess(WORDS[randomIndex]);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setMessage('');
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleGuess = (letter: string) => {
    if (gameOver || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!wordToGuess.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      if (newWrongGuesses >= MAX_GUESSES) {
        setMessage(`Game Over! The word was ${wordToGuess}`);
        setGameOver(true);
        onGameEnd(score);
      }
    }

    // Check for win
    const isWin = wordToGuess.split('').every(char => newGuessedLetters.includes(char));
    if (isWin) {
      setMessage('You win!');
      const newScore = score + (MAX_GUESSES - wrongGuesses);
      setScore(newScore);
      setGameOver(true);
      onGameEnd(newScore);
    }
  };

  const displayWord = wordToGuess
    .split('')
    .map(char => (guessedLetters.includes(char) ? char : '_'))
    .join(' ');

  const handleRestart = () => {
    initializeGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      updateUserHighScore(user.uid, 'hangman-game', score);
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
        values={{maxGuesses: MAX_GUESSES}}
      />
      <div className="text-xl mb-4">Score: {score}</div>
      <h2 className="text-3xl font-bold mb-8">{displayWord}</h2>
      <p className="text-xl mb-4">Wrong Guesses: {wrongGuesses} / {MAX_GUESSES}</p>
      <p className="text-xl mb-4">{message}</p>

      {!gameOver && (
        <div className="grid grid-cols-7 gap-2 mb-8">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={guessedLetters.includes(letter)}
              className="w-10 h-10 bg-blue-500 text-white font-bold rounded-md disabled:bg-gray-400"
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="mt-4 text-2xl font-bold text-red-600">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  );
};

export default HangmanGame;
