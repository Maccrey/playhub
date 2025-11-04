
'use client';

import { useState, useEffect, useCallback } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
}

const INSTRUCTION_KEY = 'card-flip';

const CardFlip = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const initializeGame = useCallback(() => {
    const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const gameCards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, isFlipped: false }));
    setCards(gameCards);
    setFlipped([]);
    setSolved([]);
    setScore(0);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || solved.includes(index) || flipped.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setSolved((prevSolved) => [...prevSolved, first, second]);
        setScore((prevScore) => prevScore + 10);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  useEffect(() => {
    if (solved.length > 0 && solved.length === cards.length) {
      onGameEnd(score);
    }
  }, [solved, cards, score, onGameEnd]);

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'card-flip', score);
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
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`w-24 h-32 flex items-center justify-center rounded-lg cursor-pointer transition-transform duration-500 ${flipped.includes(index) || solved.includes(card.id) ? 'bg-blue-400' : 'bg-gray-400'}`}
            onClick={() => handleCardClick(index)}
            style={{ transform: flipped.includes(index) || solved.includes(card.id) ? 'rotateY(180deg)' : '' }}
          >
            <div style={{ transform: flipped.includes(index) || solved.includes(card.id) ? 'rotateY(180deg)' : '' }}>
              {(flipped.includes(index) || solved.includes(card.id)) ? card.symbol : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardFlip;
