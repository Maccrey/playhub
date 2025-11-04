
'use client';

import {useState, useEffect, useCallback} from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import {updateUserHighScore} from '@/lib/firestore';

const INSTRUCTION_KEY = 'maze-escape';

const baseMazeLayout: string[][] = [
  ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
  ['W', 'P', ' ', ' ', 'W', ' ', ' ', ' ', ' ', 'W'],
  ['W', 'W', 'W', ' ', 'W', ' ', 'W', 'W', ' ', 'W'],
  ['W', ' ', ' ', ' ', ' ', ' ', 'W', ' ', ' ', 'W'],
  ['W', ' ', 'W', 'W', 'W', 'W', 'W', ' ', 'W', 'W'],
  ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
  ['W', 'W', 'W', 'W', 'W', ' ', 'W', 'W', 'W', 'W'],
  ['W', ' ', ' ', ' ', 'W', ' ', ' ', ' ', 'E', 'W'],
  ['W', ' ', 'W', ' ', ' ', ' ', 'W', ' ', ' ', 'W'],
  ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
];

interface Position {
  x: number;
  y: number;
}

const START_POSITION: Position = {x: 1, y: 1};

const createMaze = () => baseMazeLayout.map((row) => [...row]);

const MazeEscape = ({onGameEnd}: {onGameEnd: (score: number) => void}) => {
  const [maze, setMaze] = useState<string[][]>(createMaze);
  const [playerPosition, setPlayerPosition] = useState<Position>({...START_POSITION});
  const [startTime, setStartTime] = useState(() => Date.now());
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const {user} = useUserStore();

  const resetGame = useCallback(() => {
    setMaze(createMaze());
    setPlayerPosition({...START_POSITION});
    setStartTime(Date.now());
    setGameOver(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameOver) return;

      const {x, y} = playerPosition;
      let newX = x;
      let newY = y;

      if (event.key === 'ArrowUp') newY -= 1;
      if (event.key === 'ArrowDown') newY += 1;
      if (event.key === 'ArrowLeft') newX -= 1;
      if (event.key === 'ArrowRight') newX += 1;

      const tile = maze[newY]?.[newX];
      if (!tile || tile === 'W') {
        return;
      }

      setPlayerPosition({x: newX, y: newY});

      if (tile === 'E') {
        setGameOver(true);
        const timeTakenSeconds = (Date.now() - startTime) / 1000;
        const score = Math.max(0, 1000 - Math.floor(timeTakenSeconds));
        onGameEnd(score);
        alert(`You escaped in ${timeTakenSeconds.toFixed(2)} seconds!`);
      }
    },
    [gameOver, maze, onGameEnd, playerPosition, startTime]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleRestart = () => {
    resetGame();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      const timeTaken = (Date.now() - startTime) / 1000;
      const score = Math.max(0, 1000 - Math.floor(timeTaken));
      updateUserHighScore(user.uid, 'maze-escape', score);
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
      <div className="grid grid-cols-10 gap-0.5 bg-black p-1">
        {maze.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`w-8 h-8 flex items-center justify-center ${cell === 'W' ? 'bg-gray-800' : 'bg-white'}`}
            >
              {rowIndex === playerPosition.y && columnIndex === playerPosition.x
                ? 'P'
                : cell === 'E'
                  ? 'E'
                  : ''}
            </div>
          ))
        )}
      </div>
      <div className="mt-4">Use arrow keys to move. P: Player, E: Exit</div>
    </div>
  );
};

export default MazeEscape;
