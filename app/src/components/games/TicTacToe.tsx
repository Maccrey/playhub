
'use client';

import {useState} from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import {updateUserHighScore} from '@/lib/firestore';

const INSTRUCTION_KEY = 'tictactoe';

type SquareValue = 'X' | 'O' | null;

const createEmptyBoard = (): SquareValue[] => Array(9).fill(null);

const TicTacToe = ({onGameEnd}: {onGameEnd: (score: number) => void}) => {
  const [board, setBoard] = useState<SquareValue[]>(createEmptyBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [wins, setWins] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const {user} = useUserStore();

  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setIsXNext(true);
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'tictactoe', wins);
      alert('Score saved!');
    } else {
      alert('You must be logged in to save your score.');
    }
  };

  const handleShowInstructions = () => {
    setShowInstructions((prev) => !prev);
  };

  const handleClick = (index: number) => {
    if (calculateWinner(board) || board[index]) {
      return;
    }

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    const nextWinner = calculateWinner(newBoard);

    setBoard(newBoard);
    setIsXNext(!isXNext);

    if (nextWinner === 'X') {
      setWins((currentWins) => currentWins + 1);
      onGameEnd(1);
    }
  };

  const winner = calculateWinner(board);
  const status = winner ? `Winner: ${winner}` : `Next player: ${isXNext ? 'X' : 'O'}`;

  const renderSquare = (index: number) => (
    <button
      className="w-20 h-20 bg-white border border-gray-400 text-3xl font-bold"
      onClick={() => handleClick(index)}
    >
      {board[index]}
    </button>
  );

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
      <div className="text-2xl mb-4">{status}</div>
      <div className="text-xl mb-4">Wins: {wins}</div>
      <div className="grid grid-cols-3">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="grid grid-cols-3">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="grid grid-cols-3">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
};

function calculateWinner(squares: SquareValue[]): SquareValue {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default TicTacToe;
