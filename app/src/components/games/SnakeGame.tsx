
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const GRID_SIZE = 20;
const CELL_SIZE = 20; // pixels
const GAME_SPEED = 150; // milliseconds
const INSTRUCTION_KEY = 'snake-game';

type SnakeSegment = { x: number; y: number; };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const createInitialSnake = (): SnakeSegment[] => [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const SnakeGame = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [snake, setSnake] = useState<SnakeSegment[]>(createInitialSnake);
  const [food, setFood] = useState<SnakeSegment>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUserStore();
  const snakeRef = useRef<SnakeSegment[]>(createInitialSnake());
  const directionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef(food);
  const scoreRef = useRef(score);

  const setDirectionSafely = (nextDirection: Direction) => {
    directionRef.current = nextDirection;
  };

  const generateFood = useCallback((currentSnake: SnakeSegment[] = snakeRef.current) => {
    let newFood: SnakeSegment;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
    foodRef.current = newFood;
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case 'UP':
          head.y--;
          break;
        case 'DOWN':
          head.y++;
          break;
        case 'LEFT':
          head.x--;
          break;
        case 'RIGHT':
          head.x++;
          break;
      }

      const hitWall =
        head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE;

      if (hitWall) {
        setGameOver(true);
        if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
        onGameEnd(scoreRef.current);
        return prevSnake;
      }

      const ateFood = head.x === foodRef.current.x && head.y === foodRef.current.y;
      const bodyToCheck = ateFood ? prevSnake : prevSnake.slice(0, -1);
      const hitBody = bodyToCheck.some(
        segment => segment.x === head.x && segment.y === head.y
      );

      if (hitBody) {
        setGameOver(true);
        if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
        onGameEnd(scoreRef.current);
        return prevSnake;
      }

      const nextSnake = [head, ...prevSnake];

      if (ateFood) {
        setScore(prevScore => {
          const nextScore = prevScore + 1;
          scoreRef.current = nextScore;
          return nextScore;
        });
        generateFood(nextSnake);
      } else {
        nextSnake.pop();
      }

      snakeRef.current = nextSnake;
      return nextSnake;
    });
  }, [generateFood, onGameEnd]);

  const initializeGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setDirectionSafely('RIGHT');
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    generateFood(initialSnake);
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
    }
    gameIntervalRef.current = setInterval(moveSnake, GAME_SPEED);
  }, [generateFood, moveSnake]);

  useEffect(() => {
    initializeGame();
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [initializeGame]);

  const changeDirection = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
    const currentDirection = directionRef.current;
    switch (e.key) {
      case 'ArrowUp':
        if (currentDirection !== 'DOWN') setDirectionSafely('UP');
        break;
      case 'ArrowDown':
        if (currentDirection !== 'UP') setDirectionSafely('DOWN');
        break;
      case 'ArrowLeft':
        if (currentDirection !== 'RIGHT') setDirectionSafely('LEFT');
        break;
      case 'ArrowRight':
        if (currentDirection !== 'LEFT') setDirectionSafely('RIGHT');
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', changeDirection, { passive: false });
    return () => {
      document.removeEventListener('keydown', changeDirection);
    };
  }, [changeDirection]);

  const handleRestart = () => {
    initializeGame();
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'snake-game', scoreRef.current);
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
      <div
        className="relative border-2 border-gray-800 bg-gray-200"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-green-500 border border-green-700"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          ></div>
        ))}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        ></div>
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-3xl font-bold">
            Game Over! Final Score: {score}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;
