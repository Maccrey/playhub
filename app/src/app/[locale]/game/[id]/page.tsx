import GameRunner from '@/components/games/GameRunner';
import {DYNAMIC_GAME_CATALOG} from '@/data/games';
import {locales} from '@/i18n';

type PageProps = {
  params: {
    locale: string;
    id: string;
  };
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    DYNAMIC_GAME_CATALOG.map(({id}) => ({
      locale,
      id
    }))
  );
}

const GamePage = ({params}: PageProps) => {
  return <GameRunner gameId={params.id} />;
};

export default GamePage;
