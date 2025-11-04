
import { Link } from '@/navigation';
import useUserStore from '@/store/userStore';
import { toggleFavoriteGame } from '@/lib/firestore';
import { motion } from 'framer-motion';

interface GameCardProps {
  game: {
    id: string;
    name: string;
    path: string;
  };
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { user, favoriteGames, setFavoriteGames } = useUserStore();
  const isFavorite = favoriteGames.includes(game.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (!user) {
      alert('You must be logged in to favorite games.');
      return;
    }
    await toggleFavoriteGame(user.uid, game.id);
    // Update local state
    const newFavoriteGames = isFavorite
      ? favoriteGames.filter((id) => id !== game.id)
      : [...favoriteGames, game.id];
    setFavoriteGames(newFavoriteGames);
  };

  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Link href={game.path}>
        <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold">{game.name}</h2>
        </div>
      </Link>
      <button 
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 text-2xl ${isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-400`}
      >
        ⭐
      </button>
    </motion.div>
  );
};

export default GameCard;
