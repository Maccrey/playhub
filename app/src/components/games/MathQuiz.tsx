
'use client';

import {useState} from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import {updateUserHighScore} from '@/lib/firestore';

const INSTRUCTION_KEY = 'math-quiz';

type Operator = '+' | '-' | '*' | '/';

interface MathQuestion {
  number1: number;
  number2: number;
  operator: Operator;
}

const createMathQuestion = (): MathQuestion => {
  const operators: Operator[] = ['+', '-', '*', '/'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  let number1 = Math.floor(Math.random() * 10) + 1;
  const number2 = Math.floor(Math.random() * 10) + 1;

  if (operator === '/') {
    number1 = number1 * number2;
  }

  return {number1, number2, operator};
};

const MathQuiz = ({onGameEnd}: {onGameEnd: (score: number) => void}) => {
  const [question, setQuestion] = useState<MathQuestion>(createMathQuestion);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('Solve the equation!');
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const {user} = useUserStore();

  const generateQuestion = () => {
    setQuestion(createMathQuestion());
    setAnswer('');
    setMessage('Solve the equation!');
  };

  const checkAnswer = () => {
    const {number1, number2, operator} = question;

    let correctAnswer: number;
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

    if (Number(answer) === correctAnswer) {
      setMessage('Correct!');
      setScore((prevScore) => prevScore + 1);
      generateQuestion();
    } else {
      setMessage('Incorrect. Try again.');
      setScore((prevScore) => Math.max(0, prevScore - 1));
    }
  };

  const handleRestart = () => {
    setScore(0);
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
      <div className="text-3xl font-bold mb-8">
        {question.number1} {question.operator} {question.number2} = ?
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          checkAnswer();
        }}
        className="flex space-x-2 mb-4"
      >
        <input
          type="number"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
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
