
'use client';

import { useState } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const choices = ['rock', 'paper', 'scissors'] as const;
const pickRandomChoice = (items: readonly string[]) =>
  items[Math.floor(Math.random() * items.length)];
const INSTRUCTION_KEY = 'rock-paper-scissors';

const RockPaperScissors = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const handlePlay = (choice: string) => {
    setPlayerChoice(choice);
    const compChoice = pickRandomChoice(choices);
    setComputerChoice(compChoice);
    determineWinner(choice, compChoice);
  };

  const determineWinner = (player: string, computer: string) => {
    if (player === computer) {
      setResult('It\'s a tie!');
    } else if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      setResult('You win!');
      setScore(score + 1);
    } else {
      setResult('You lose!');
      setScore(Math.max(0, score - 1));
    }
  };

  const handleRestart = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScore(0);
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'rock-paper-scissors', score);
      onGameEnd(score);
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
      <div className="flex space-x-4 mb-8">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => handlePlay(choice)}
            className="px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 capitalize"
          >
            {choice}
          </button>
        ))}
      </div>

      {playerChoice && computerChoice && (
        <div className="text-center text-2xl mb-4">
          <p>You chose: {playerChoice}</p>
          <p>Computer chose: {computerChoice}</p>
          <p className="mt-2 font-bold">{result}</p>
        </div>
      )}
    </div>
  );
};

export default RockPaperScissors;
