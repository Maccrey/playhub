'use client';

import {useMemo} from 'react';
import {useTranslations} from 'next-intl';
import AdBanner from '@/components/AdBanner';
import TicTacToe from '@/components/games/TicTacToe';
import CardFlip from '@/components/games/CardFlip';
import ClickChallenge from '@/components/games/ClickChallenge';
import ColorMatch from '@/components/games/ColorMatch';
import ColorReaction from '@/components/games/ColorReaction';
import DailyMission from '@/components/games/DailyMission';
import Game2048 from '@/components/games/Game2048';
import GuessTheNumber from '@/components/games/GuessTheNumber';
import HangmanGame from '@/components/games/HangmanGame';
import MathQuiz from '@/components/games/MathQuiz';
import MazeEscape from '@/components/games/MazeEscape';
import MergeDice from '@/components/games/MergeDice';
import MiniChess from '@/components/games/MiniChess';
import NumberPyramid from '@/components/games/NumberPyramid';
import RockPaperScissors from '@/components/games/RockPaperScissors';
import SimonGame from '@/components/games/SimonGame';
import SnakeGame from '@/components/games/SnakeGame';
import SpeedTyping from '@/components/games/SpeedTyping';
import WordPuzzle from '@/components/games/WordPuzzle';
import BlockDodger from '@/components/games/BlockDodger';
import useUserStore from '@/store/userStore';
import {updateGamePlayed} from '@/lib/firestore';
import {DynamicGameId, GAME_META_BY_ID, isDynamicGameId} from '@/data/games';

type GameComponentProps = {
  onGameEnd: (score: number) => void;
};

const GAME_COMPONENTS: Record<DynamicGameId, React.ComponentType<GameComponentProps>> = {
  'tictactoe': TicTacToe,
  'card-flip': CardFlip,
  'guess-the-number': GuessTheNumber,
  'merge-dice': MergeDice,
  'maze-escape': MazeEscape,
  'color-reaction': ColorReaction,
  'snake-game': SnakeGame,
  '2048-game': Game2048,
  'block-dodger': BlockDodger,
  'rock-paper-scissors': RockPaperScissors,
  'word-puzzle': WordPuzzle,
  'click-challenge': ClickChallenge,
  'simon-game': SimonGame,
  'mini-chess': MiniChess,
  'math-quiz': MathQuiz,
  'color-match': ColorMatch,
  'number-pyramid': NumberPyramid,
  'daily-mission': DailyMission,
  'speed-typing': SpeedTyping,
  'hangman-game': HangmanGame
};

type GameRunnerProps = {
  gameId: string | undefined;
};

const GameRunner = ({gameId}: GameRunnerProps) => {
  const resolvedId = Array.isArray(gameId) ? gameId[0] : gameId;
  const homeTranslations = useTranslations('Home');
  const {user, setUser} = useUserStore();

  const gameMeta = useMemo(() => GAME_META_BY_ID.get(resolvedId ?? ''), [resolvedId]);
  const isSupportedGame = resolvedId && isDynamicGameId(resolvedId);
  const gameTitle = gameMeta
    ? homeTranslations(`games.${gameMeta.translationKey}`)
    : homeTranslations('title');

  const handleGameEnd = async (score: number) => {
    if (!user || !resolvedId) return;

    const updatedUser = {...user};
    if (!updatedUser.gameStats) {
      updatedUser.gameStats = {};
    }

    if (!updatedUser.gameStats[resolvedId]) {
      updatedUser.gameStats[resolvedId] = {
        highScore: 0,
        gamesPlayed: 0,
        lastPlayed: null
      };
    }

    updatedUser.gameStats[resolvedId].gamesPlayed += 1;
    updatedUser.gameStats[resolvedId].lastPlayed = new Date().toISOString();

    if (score > updatedUser.gameStats[resolvedId].highScore) {
      updatedUser.gameStats[resolvedId].highScore = score;
    }

    setUser(updatedUser);
    await updateGamePlayed(user.uid, resolvedId, score);
  };

  const GameComponent = isSupportedGame ? GAME_COMPONENTS[resolvedId] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          {GameComponent ? (
            <GameComponent onGameEnd={handleGameEnd} />
          ) : (
            <div className="text-lg">{gameTitle}</div>
          )}
        </div>
        <AdBanner />
      </main>
    </div>
  );
};

export default GameRunner;
