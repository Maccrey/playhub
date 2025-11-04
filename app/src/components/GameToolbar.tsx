
'use client';

import {Link} from '@/navigation';
import {useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';
import {GAME_META_BY_ID} from '@/data/games';

interface GameToolbarProps {
  title?: string;
  onRestart: () => void;
  onSaveScore: () => void;
  onShowInstructions: () => void;
}

const GameToolbar: React.FC<GameToolbarProps> = ({
  title,
  onRestart,
  onSaveScore,
  onShowInstructions
}) => {
  const toolbarTranslations = useTranslations('GameToolbar');
  const gameTranslations = useTranslations('Home.games');
  const params = useParams<{id?: string}>();

  const rawId = params?.id ?? '';
  const gameId = Array.isArray(rawId) ? rawId[0] : rawId;
  const gameMeta = gameId ? GAME_META_BY_ID.get(gameId) : undefined;

  let resolvedTitle = title;

  if (!resolvedTitle && gameMeta) {
    try {
      resolvedTitle = gameTranslations(
        gameMeta.translationKey as Parameters<typeof gameTranslations>[0]
      );
    } catch {
      resolvedTitle = gameMeta.id;
    }
  }

  return (
    <div className="flex flex-col items-center my-4">
      {resolvedTitle ? (
        <h1 className="text-4xl font-bold mb-4">{resolvedTitle}</h1>
      ) : null}
      <div className="flex space-x-4">
        <Link
          href="/"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {toolbarTranslations('home')}
        </Link>
        <button
          onClick={onRestart}
          className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          {toolbarTranslations('restart')}
        </button>
        <button
          onClick={onSaveScore}
          className="px-4 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
        >
          {toolbarTranslations('saveScore')}
        </button>
        <button
          onClick={onShowInstructions}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {toolbarTranslations('howToPlay')}
        </button>
      </div>
    </div>
  );
};

export default GameToolbar;
