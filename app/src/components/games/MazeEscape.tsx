
'use client';

import { useState, useEffect } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const INSTRUCTION_KEY = 'maze-escape';

const MazeEscape = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [maze, setMaze] = useState<string[][]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [startTime, setStartTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const generateMaze = () => {
    // Simple 10x10 maze
    const newMaze = [
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
    setMaze(newMaze);
    setPlayerPosition({ x: 1, y: 1 });
    setStartTime(Date.now());
    setGameOver(false);
  };

  useEffect(() => {
    generateMaze();
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver) return;
    const { x, y } = playerPosition;
    let newX = x, newY = y;

    if (e.key === 'ArrowUp') newY--;
    if (e.key === 'ArrowDown') newY++;
    if (e.key === 'ArrowLeft') newX--;
    if (e.key === 'ArrowRight') newX++;

    if (maze[newY] && maze[newY][newX] && maze[newY][newX] !== 'W') {
      setPlayerPosition({ x: newX, y: newY });
      if (maze[newY][newX] === 'E') {
        setGameOver(true);
        const timeTaken = (Date.now() - startTime) / 1000;
        const score = Math.max(0, 1000 - Math.floor(timeTaken));
        onGameEnd(score);
        alert(`You escaped in ${timeTaken.toFixed(2)} seconds!`);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPosition, gameOver]);

  const handleRestart = () => {
    generateMaze();
  };

  const handleSaveScore = () => {
    if (user && gameOver) {
      const timeTaken = (Date.now() - startTime) / 1000;
      const score = Math.max(0, 1000 - Math.floor(timeTaken)); // Higher score for faster time
      updateUserHighScore(user.uid, 'maze-escape', score);
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
      <div className="grid grid-cols-10 gap-0.5 bg-black p-1">
        {maze.map((row, y) => 
          row.map((cell, x) => (
            <div 
              key={`${y}-${x}`}
              className={`w-8 h-8 flex items-center justify-center ${cell === 'W' ? 'bg-gray-800' : 'bg-white'}`}
            >
              {y === playerPosition.y && x === playerPosition.x ? 'P' : (cell === 'E' ? 'E' : '')}
            </div>
          ))
        )}
      </div>
      <div className="mt-4">Use arrow keys to move. P: Player, E: Exit</div>
    </div>
  );
};

export default MazeEscape;
