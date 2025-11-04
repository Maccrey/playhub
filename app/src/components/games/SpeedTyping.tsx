
'use client';

import { useState, useEffect, useRef } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Never underestimate the power of a good book.",
  "Practice makes perfect, especially in typing.",
  "The early bird catches the worm, but the second mouse gets the cheese.",
  "Innovation distinguishes between a leader and a follower.",
];

const GAME_DURATION = 60; // seconds

const INSTRUCTION_KEY = 'speed-typing';

const SpeedTyping = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [currentText, setCurrentText] = useState('');
  const [inputText, setInputText] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUserStore();

  const selectRandomText = () => {
    const randomIndex = Math.floor(Math.random() * TEXTS.length);
    setCurrentText(TEXTS[randomIndex]);
  };

  const startGame = () => {
    selectRandomText();
    setInputText('');
    setTimeLeft(GAME_DURATION);
    setWpm(0);
    setAccuracy(0);
    setGameOver(false);
    setGameStarted(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setGameStarted(false);
          setGameOver(true);
          calculateResults();
          const finalScore = wpm * (accuracy / 100);
          onGameEnd(Math.round(finalScore));
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const calculateResults = () => {
    const wordsTyped = inputText.split(' ').filter(word => word !== '').length;
    const minutes = GAME_DURATION / 60;
    const calculatedWpm = Math.round(wordsTyped / minutes);
    setWpm(calculatedWpm);

    let correctChars = 0;
    for (let i = 0; i < inputText.length; i++) {
      if (inputText[i] === currentText[i]) {
        correctChars++;
      }
    }
    const calculatedAccuracy = currentText.length > 0 ? Math.round((correctChars / currentText.length) * 100) : 0;
    setAccuracy(calculatedAccuracy);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameStarted || gameOver) return;
    setInputText(e.target.value);
  };

  const handleRestart = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    startGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      // Score based on WPM and Accuracy
      const finalScore = wpm * (accuracy / 100);
      updateUserHighScore(user.uid, 'speed-typing', Math.round(finalScore));
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
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
        values={{time: GAME_DURATION}}
      />
      <div className="text-xl mb-4">Time Left: {timeLeft}s</div>
      <div className="w-3/4 p-4 bg-gray-200 rounded-md mb-4 text-lg leading-relaxed">
        {currentText.split('').map((char, index) => (
          <span
            key={index}
            className={
              index < inputText.length
                ? char === inputText[index]
                  ? 'text-green-600'
                  : 'text-red-600'
                : 'text-gray-700'
            }
          >
            {char}
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        className="w-3/4 p-3 border-2 border-gray-400 rounded-md text-lg focus:outline-none focus:border-blue-500"
        disabled={!gameStarted || gameOver}
        placeholder={gameStarted ? "Start typing..." : "Press Start Game to begin"}
      />
      {!gameStarted && !gameOver && (
        <button 
          onClick={startGame}
          className="mt-4 px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700"
        >
          Start Game
        </button>
      )}
      {gameOver && (
        <div className="mt-4 text-2xl font-bold text-red-600 text-center">
          Game Over! <br /> WPM: {wpm}, Accuracy: {accuracy}%
        </div>
      )}
    </div>
  );
};

export default SpeedTyping;
