
'use client';

import { useState, useEffect } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const INSTRUCTION_KEY = 'merge-dice';

const MergeDice = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [board, setBoard] = useState<(number | null)[]>(Array(25).fill(null));
  const [nextDice, setNextDice] = useState(1);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const generateNextDice = () => {
    setNextDice(Math.floor(Math.random() * 6) + 1);
  };

  const initializeGame = () => {
    setBoard(Array(25).fill(null));
    setScore(0);
    generateNextDice();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCellClick = (index: number) => {
    if (board[index] !== null) return; // Cell is already occupied

    const newBoard = [...board];
    newBoard[index] = nextDice;
    const newScore = score + nextDice;
    setBoard(newBoard);
    setScore(newScore);
    generateNextDice();

    const isBoardFull = newBoard.every(cell => cell !== null);
    if (isBoardFull) {
      onGameEnd(newScore);
    }
    // TODO: Implement merge logic
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'merge-dice', score);
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
      <div className="text-xl mb-4">Next Dice: {nextDice}</div>
      <div className="grid grid-cols-5 gap-1 bg-gray-300 p-1">
        {board.map((cell, index) => (
          <div 
            key={index}
            onClick={() => handleCellClick(index)}
            className="w-16 h-16 bg-white flex items-center justify-center text-2xl font-bold cursor-pointer"
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MergeDice;
