/* eslint-disable react-hooks/purity */

'use client';

import { useState, useEffect, useRef } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const COLORS = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
];

const GAME_TIME = 30; // seconds

const INSTRUCTION_KEY = 'color-match';

const ColorMatch = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [currentColor, setCurrentColor] = useState<{ name: string; hex: string } | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUserStore();

  const getNewQuestion = () => {
    const correctColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const newOptions = shuffledColors.slice(0, 4).map(c => c.name);

    if (!newOptions.includes(correctColor.name)) {
      newOptions[Math.floor(Math.random() * 4)] = correctColor.name;
    }
    return { correctColor, options: newOptions.sort(() => Math.random() - 0.5) };
  }

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setGameOver(false);
    setGameStarted(true);
    
    const { correctColor, options } = getNewQuestion();
    setCurrentColor(correctColor);
    setOptions(options);

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

  const handleAnswer = (selectedName: string) => {
    if (gameOver || !gameStarted) return;

    if (currentColor && selectedName === currentColor.name) {
      setScore(prevScore => prevScore + 1);
    } else {
      setScore(prevScore => Math.max(0, prevScore - 1));
    }
    
    const { correctColor, options } = getNewQuestion();
    setCurrentColor(correctColor);
    setOptions(options);
  };

  const handleRestart = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    startGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      updateUserHighScore(user.uid, 'color-match', score);
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
      onGameEnd(score);
    }
  }, [gameOver, score, onGameEnd]);

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
        values={{time: GAME_TIME}}
      />
      <div className="text-xl mb-4">Score: {score}</div>
      <div className="text-xl mb-4">Time Left: {timeLeft}s</div>

      {!gameStarted && !gameOver && (
        <button 
          onClick={startGame}
          className="mt-4 px-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700"
        >
          Start Game
        </button>
      )}

      {gameStarted && currentColor && (
        <div className="mb-8">
          <div 
            className="w-48 h-48 rounded-lg flex items-center justify-center text-white text-3xl font-bold mb-4"
            style={{ backgroundColor: currentColor.hex }}
          >
            {/* Display the color, not the name */}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="px-6 py-3 text-lg font-semibold text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {option}
              </button>
            ))}
          </div>
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

export default ColorMatch;
