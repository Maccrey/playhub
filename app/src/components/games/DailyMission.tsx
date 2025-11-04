
'use client';

import { useState, useCallback } from 'react';
import GameToolbar from '@/components/GameToolbar';
import GameInstructionsModal from '@/components/GameInstructionsModal';
import useUserStore from '@/store/userStore';
import { updateUserHighScore } from '@/lib/firestore';

const MISSIONS = [
  'Click 10 times in 5 seconds',
  'Solve 3 math problems',
  'Find 2 pairs in Card Flip',
  'Reach score 5 in Snake Game',
];

const INSTRUCTION_KEY = 'daily-mission';

const computeDailyMission = () => {
  const today = new Date().toDateString();
  const missionIndex = today.charCodeAt(0) % MISSIONS.length;
  return MISSIONS[missionIndex];
};

const DailyMission = ({ onGameEnd }: { onGameEnd: (score: number) => void }) => {
  const [currentMission, setCurrentMission] = useState<string>(computeDailyMission);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const { user } = useUserStore();

  const selectDailyMission = useCallback(() => {
    setCurrentMission(computeDailyMission());
    setMissionCompleted(false);
  }, []);

  const handleCompleteMission = () => {
    setMissionCompleted(true);
    const newScore = score + 100;
    setScore(newScore);
    onGameEnd(newScore);
    alert('Mission Completed! +100 points!');
  };

  const handleRestart = () => {
    selectDailyMission();
    setScore(0);
  };

  const handleSaveScore = () => {
    if (user) {
      updateUserHighScore(user.uid, 'daily-mission', score);
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
      <h2 className="text-2xl font-bold mb-4">Today&apos;s Mission:</h2>
      <p className="text-xl mb-8">{currentMission}</p>
      {!missionCompleted ? (
        <button 
          onClick={handleCompleteMission}
          className="px-6 py-3 bg-green-500 text-white text-lg rounded-md hover:bg-green-600"
        >
          Mark as Complete
        </button>
      ) : (
        <p className="text-green-600 text-xl font-bold">Mission Accomplished!</p>
      )}
    </div>
  );
};

export default DailyMission;
