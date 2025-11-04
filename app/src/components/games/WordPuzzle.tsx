
'use client';

import {useState, useCallback} from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import {updateUserHighScore} from '@/lib/firestore';

const words = [
  {scrambled: 'ELPPA', answer: 'APPLE'},
  {scrambled: 'LEMON', answer: 'MELON'},
  {scrambled: 'GRAPE', answer: 'PEAR'},
  {scrambled: 'ANANAB', answer: 'BANANA'},
  {scrambled: 'ERRYB', answer: 'BERRY'},
];

const INSTRUCTION_KEY = 'word-puzzle';

const shuffleLetters = (value: string) => value.split('').sort(() => Math.random() - 0.5);

type WordEntry = (typeof words)[number];

const WordPuzzle = ({onGameEnd}: {onGameEnd: (score: number) => void}) => {
  const initialWord: WordEntry | null = words[0] ?? null;
  const [wordIndex, setWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordEntry | null>(initialWord);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>(() =>
    initialWord ? shuffleLetters(initialWord.scrambled) : []
  );
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const {user} = useUserStore();

  const loadNewWord = useCallback(
    (index: number, finalScore: number) => {
      if (index >= words.length) {
        setCurrentWord(null);
        setShuffledLetters([]);
        setSelectedLetters([]);
        setMessage('Game Over! All words guessed.');
        onGameEnd(finalScore);
        return;
      }

      const word = words[index];
      setCurrentWord(word);
      setShuffledLetters(shuffleLetters(word.scrambled));
      setSelectedLetters([]);
      setMessage('');
    },
    [onGameEnd]
  );

  const handleLetterClick = (letter: string, index: number) => {
    setSelectedLetters((prev) => [...prev, letter]);
    setShuffledLetters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    if (currentWord) {
      setShuffledLetters(shuffleLetters(currentWord.scrambled));
      setSelectedLetters([]);
    }
  };

  const handleSubmit = () => {
    if (!currentWord) return;

    const guessedWord = selectedLetters.join('');
    if (guessedWord === currentWord.answer) {
      setMessage('Correct!');
      const nextScore = score + 10;
      const nextIndex = wordIndex + 1;
      setScore(nextScore);
      setWordIndex(nextIndex);
      setTimeout(() => loadNewWord(nextIndex, nextScore), 1000);
    } else {
      setMessage('Incorrect. Try again.');
      setScore((prevScore) => Math.max(0, prevScore - 5));
      handleClear();
    }
  };

  const handleRestart = useCallback(() => {
    setWordIndex(0);
    setScore(0);
    loadNewWord(0, 0);
  }, [loadNewWord]);

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'word-puzzle', score);
      alert('Score saved!');
    } else {
      alert('You must be logged in to save your score.');
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
      <div className="text-xl mb-4">Score: {score}</div>
      {currentWord && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Unscramble the word:</h2>
          <div className="flex justify-center space-x-2 mb-4">
            {selectedLetters.map((letter, index) => (
              <span
                key={index}
                className="w-10 h-10 bg-blue-200 flex items-center justify-center text-xl font-bold rounded-md"
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            {shuffledLetters.map((letter, index) => (
              <button
                key={`${letter}-${index}`}
                onClick={() => handleLetterClick(letter, index)}
                className="w-10 h-10 bg-gray-200 flex items-center justify-center text-xl font-bold rounded-md hover:bg-gray-300"
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="flex justify-center space-x-4">
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md">
              Submit
            </button>
            <button onClick={handleClear} className="px-4 py-2 bg-red-500 text-white rounded-md">
              Clear
            </button>
          </div>
        </div>
      )}
      <p className="text-xl font-semibold text-center">{message}</p>
    </div>
  );
};

export default WordPuzzle;
