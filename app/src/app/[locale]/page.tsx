
'use client';

import { useMemo, useState } from 'react';
import GameCard from '@/components/GameCard';
import useUserStore from '@/store/userStore';
import { useTranslations } from 'next-intl';
import { GAME_CATALOG } from '@/data/games';

export default function Home() {
  const [filter, setFilter] = useState<'popular' | 'latest' | 'favorites'>('popular');
  const { favoriteGames } = useUserStore();
  const t = useTranslations('Home');

  const allGames = useMemo(
    () =>
      GAME_CATALOG.map((game) => ({
        id: game.id,
        path: game.path,
        name: t(`games.${game.translationKey}`)
      })),
    [t]
  );

  const filteredGames =
    filter === 'favorites'
      ? allGames.filter((game) => favoriteGames.includes(game.id))
      : allGames;

  return (
    <div>
      <h1 className="text-4xl font-bold text-center my-8">{t('title')}</h1>
      <div className="flex justify-center mb-8">
        <button 
          onClick={() => setFilter('popular')}
          className={`px-4 py-2 rounded-l-lg ${filter === 'popular' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {t('popular')}
        </button>
        <button 
          onClick={() => setFilter('latest')}
          className={`px-4 py-2 ${filter === 'latest' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {t('latest')}
        </button>
        <button 
          onClick={() => setFilter('favorites')}
          className={`px-4 py-2 rounded-r-lg ${filter === 'favorites' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {t('favorites')}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
