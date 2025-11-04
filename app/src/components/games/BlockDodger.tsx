
'use client';

import { useState, useRef } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 30;
const BLOCK_SIZE = 30;
const BLOCK_SPEED = 5;
const BLOCK_INTERVAL = 1000; // ms

const INSTRUCTION_KEY = 'block-dodger';

const BlockDodger = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [blocks, setBlocks] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const blockSpawnRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUserStore();

  const gameLoop = () => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.map(block => ({
        ...block,
        y: block.y + BLOCK_SPEED,
      })).filter(block => block.y < GAME_HEIGHT);

      // Check for collision
      for (const block of newBlocks) {
        if (
          playerX < block.x + BLOCK_SIZE &&
          playerX + PLAYER_SIZE > block.x &&
          GAME_HEIGHT - PLAYER_SIZE < block.y + BLOCK_SIZE &&
          GAME_HEIGHT > block.y
        ) {
          setGameOver(true);
          if (gameLoopRef.current) clearInterval(gameLoopRef.current);
          if (blockSpawnRef.current) clearInterval(blockSpawnRef.current);
          onGameEnd(score);
          return prevBlocks; // Stop updating blocks
        }
      }

      setScore(prevScore => prevScore + 1);
      return newBlocks;
    });
  };

  const spawnBlock = () => {
    setBlocks(prevBlocks => [
      ...prevBlocks,
      { id: Date.now(), x: Math.random() * (GAME_WIDTH - BLOCK_SIZE), y: -BLOCK_SIZE },
    ]);
  };

  const initializeGame = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
    setBlocks([]);
    setGameOver(false);
    setScore(0);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (blockSpawnRef.current) clearInterval(blockSpawnRef.current);
    gameLoopRef.current = setInterval(gameLoop, 20);
    blockSpawnRef.current = setInterval(spawnBlock, BLOCK_INTERVAL);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameOver) return;
    const gameArea = e.currentTarget.getBoundingClientRect();
    let newPlayerX = e.clientX - gameArea.left - PLAYER_SIZE / 2;
    if (newPlayerX < 0) newPlayerX = 0;
    if (newPlayerX > GAME_WIDTH - PLAYER_SIZE) newPlayerX = GAME_WIDTH - PLAYER_SIZE;
    setPlayerX(newPlayerX);
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleSaveScore = () => {
    if (user && score > 0) {
      updateUserHighScore(user.uid, 'block-dodger', score);
      alert('Score saved!');
    } else if (!user) {
      alert('You must be logged in to save your score.');
    } else {
      alert('Play the game to save your score.');
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
        className="relative bg-gray-800 overflow-hidden"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          cursor: gameOver ? 'default' : 'none',
        }}
        onMouseMove={handleMouseMove}
      >
        {!gameOver && (
          <div
            className="absolute bg-blue-500"
            style={{
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              left: playerX,
              top: GAME_HEIGHT - PLAYER_SIZE,
            }}
          ></div>
        )}
        {blocks.map(block => (
          <div
            key={block.id}
            className="absolute bg-red-500"
            style={{
              width: BLOCK_SIZE,
              height: BLOCK_SIZE,
              left: block.x,
              top: block.y,
            }}
          ></div>
        ))}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-3xl font-bold">
            Game Over! Final Score: {score}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDodger;
