

import { useEffect, useState } from 'react';
import { getGlobalRanking, getFriendRanking } from '@/lib/firestore';
import useUserStore from '@/store/userStore';

interface Rank {
  rank: number;
  displayName: string;
  score: number;
}

interface RankingBoardProps {
  gameId: string;
}

const RankingBoard: React.FC<RankingBoardProps> = ({ gameId }) => {
  const [ranking, setRanking] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingType, setRankingType] = useState('global'); // 'global' or 'friend'
  const { user } = useUserStore();

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      let fetchedRanking: Rank[] = [];
      if (rankingType === 'global') {
        fetchedRanking = await getGlobalRanking(gameId);
      } else if (rankingType === 'friend' && user) {
        const friendScores = await getFriendRanking(user.uid, gameId);
        fetchedRanking = friendScores.map((fs, index) => ({ ...fs, rank: index + 1 }));
      }
      setRanking(fetchedRanking);
      setLoading(false);
    };

    fetchRanking();
  }, [gameId, rankingType, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-8">
      <div className="p-8">
        <div className="flex justify-center mb-4">
          <button 
            onClick={() => setRankingType('global')}
            className={`px-4 py-2 rounded-l-lg ${rankingType === 'global' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Global Ranking
          </button>
          <button 
            onClick={() => setRankingType('friend')}
            className={`px-4 py-2 rounded-r-lg ${rankingType === 'friend' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            disabled={!user} // Disable friend ranking if not logged in
          >
            Friend Ranking
          </button>
        </div>
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-4">
          {gameId} - {rankingType === 'global' ? 'Global' : 'Friend'} Ranking
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length > 0 ? (
              ranking.map((item) => (
                <tr key={item.rank} className="border-b">
                  <td className="px-4 py-2 font-medium">{item.rank}</td>
                  <td className="px-4 py-2">{item.displayName}</td>
                  <td className="px-4 py-2 text-right">{item.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-center">No ranking data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingBoard;
