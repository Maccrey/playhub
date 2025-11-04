
'use client';

import { useState, useEffect } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const words = [
  { scrambled: 'ELPPA', answer: 'APPLE' },
  { scrambled: 'LEMON', answer: 'MELON' },
  { scrambled: 'GRAPE', answer: 'PEAR' },
  { scrambled: 'ANANAB', answer: 'BANANA' },
  { scrambled: 'ERRYB', answer: 'BERRY' },
];

const INSTRUCTION_KEY = 'word-puzzle';

const WordPuzzle = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [currentWord, setCurrentWord] = useState<{ scrambled: string; answer: string } | null>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const initializeGame = () => {
    setWordIndex(0);
    setScore(0);
    setMessage('');
    loadNewWord(0);
  };

  const loadNewWord = (index: number) => {
    if (index >= words.length) {
      setMessage('Game Over! All words guessed.');
      setCurrentWord(null);
      setShuffledLetters([]);
      onGameEnd(score);
      return;
    }
    const word = words[index];
    setCurrentWord(word);
    setShuffledLetters(word.scrambled.split('').sort(() => Math.random() - 0.5));
    setSelectedLetters([]);
    setMessage('');
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleLetterClick = (letter: string, index: number) => {
    setSelectedLetters(prev => [...prev, letter]);
    setShuffledLetters(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    if (currentWord) {
      setShuffledLetters(currentWord.scrambled.split('').sort(() => Math.random() - 0.5));
      setSelectedLetters([]);
    }
  };

  const handleSubmit = () => {
    if (!currentWord) return;
    const guessedWord = selectedLetters.join('');
    if (guessedWord === currentWord.answer) {
      setMessage('Correct!');
      setScore(score + 10);
      setTimeout(() => loadNewWord(wordIndex + 1), 1000);
      setWordIndex(wordIndex + 1);
    } else {
      setMessage('Incorrect. Try again.');
      setScore(Math.max(0, score - 5));
      handleClear();
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'word-puzzle', score);
      alert('Score saved!');
    } else {
      alert('You must be logged in to save your score.');
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
      {currentWord && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Unscramble the word:</h2>
          <div className="flex justify-center space-x-2 mb-4">
            {selectedLetters.map((letter, index) => (
              <span key={index} className="w-10 h-10 bg-blue-200 flex items-center justify-center text-xl font-bold rounded-md">
                {letter}
              </span>
            ))}
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            {shuffledLetters.map((letter, index) => (
              <button
                key={index}
                onClick={() => handleLetterClick(letter, index)}
                className="w-10 h-10 bg-gray-200 flex items-center justify-center text-xl font-bold rounded-md hover:bg-gray-300"
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="flex justify-center space-x-4">
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md">Submit</button>
            <button onClick={handleClear} className="px-4 py-2 bg-red-500 text-white rounded-md">Clear</button>
          </div>
        </div>
      )}
      <p className="text-xl font-semibold text-center">{message}</p>
    </div>
  );
};

export default WordPuzzle;
