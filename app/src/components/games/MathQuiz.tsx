
'use client';

import { useState, useEffect } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const INSTRUCTION_KEY = 'math-quiz';

const MathQuiz = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('Solve the equation!');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const generateQuestion = () => {
    const ops = ['+', '-', '*', '/'];
    const newOp = ops[Math.floor(Math.random() * ops.length)];
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;

    // Ensure division results in whole numbers for simplicity
    if (newOp === '/') {
      num1 = num1 * num2; // Make num1 a multiple of num2
    }

    setNumber1(num1);
    setNumber2(num2);
    setOperator(newOp);
    setAnswer('');
    setMessage('Solve the equation!');
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const checkAnswer = () => {
    let correctAnswer;
    switch (operator) {
      case '+':
        correctAnswer = number1 + number2;
        break;
      case '-':
        correctAnswer = number1 - number2;
        break;
      case '*':
        correctAnswer = number1 * number2;
        break;
      case '/':
        correctAnswer = number1 / number2;
        break;
      default:
        correctAnswer = 0;
    }

    if (parseInt(answer) === correctAnswer) {
      setMessage('Correct!');
      setScore(score + 1);
      generateQuestion();
    } else {
      setMessage('Incorrect. Try again.');
      setScore(Math.max(0, score - 1));
    }
  };

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    generateQuestion();
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'math-quiz', score);
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
      <div className="text-3xl font-bold mb-8">
        {number1} {operator} {number2} = ?
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkAnswer();
        }}
        className="flex space-x-2 mb-4"
      >
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="px-4 py-2 border rounded-md text-center text-xl"
          autoFocus
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md text-xl">
          Submit
        </button>
      </form>
      <p className="text-xl font-semibold text-center">{message}</p>
    </div>
  );
};

export default MathQuiz;
