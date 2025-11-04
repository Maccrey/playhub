
'use client';

import {useState, useCallback} from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import {updateUserHighScore} from '@/lib/firestore';

const INSTRUCTION_KEY = 'merge-dice';

const createEmptyBoard = () => Array<(number | null)>(25).fill(null);
const rollDie = () => Math.floor(Math.random() * 6) + 1;

const MergeDice = ({onGameEnd}: {onGameEnd: (score: number) => void}) => {
  const [board, setBoard] = useState<(number | null)[]>(createEmptyBoard);
  const [nextDice, setNextDice] = useState(() => rollDie());
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const {user} = useUserStore();

  const generateNextDice = useCallback(() => {
    setNextDice(rollDie());
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setNextDice(rollDie());
  }, []);

  const handleCellClick = (index: number) => {
    if (board[index] !== null) return;

    const newBoard = [...board];
    newBoard[index] = nextDice;
    const newScore = score + nextDice;

    setBoard(newBoard);
    setScore(newScore);
    generateNextDice();

    if (newBoard.every((cell) => cell !== null)) {
      onGameEnd(newScore);
    }
  };

  const handleRestart = () => {
    resetGame();
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
