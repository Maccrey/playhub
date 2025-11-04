'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {off, onValue, ref, update} from 'firebase/database';
import {db} from '@/lib/firebase';
import useUserStore from '@/store/userStore';
import {
  addGameLog,
  assignMafiaRoles,
  updateMafiaRoomStatus,
  updatePlayerStatus
} from '@/lib/firestore';

interface Player {
  displayName: string;
  role?: string;
  isAlive?: boolean;
}

interface RoomData {
  hostId: string;
  players: Record<string, Player>;
  status: string;
  votes?: Record<string, string>;
}

type MafiaRoomProps = {
  roomId: string | null;
};

const MafiaRoom = ({roomId}: MafiaRoomProps) => {
  const {user} = useUserStore();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [myVote, setMyVote] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const roomRef = ref(db, `mafiaRooms/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as RoomData | null;
      if (data) {
        setRoomData(data);
        if (data.status === 'playing' && !timerActive) {
          setTimer(60);
          setTimerActive(true);
        } else if (data.status === 'voting' && !timerActive) {
          setTimer(30);
          setTimerActive(true);
        } else if (data.status !== 'playing' && data.status !== 'voting' && timerActive) {
          setTimerActive(false);
        }
      } else {
        setRoomData(null);
      }
      setLoading(false);
    });

    return () => {
      off(roomRef, 'value', unsubscribe);
    };
  }, [roomId, timerActive]);

  const handleStartGame = useCallback(async () => {
    if (user && roomData && user.uid === roomData.hostId && roomId) {
      const playerIds = Object.keys(roomData.players);
      await assignMafiaRoles(roomId, playerIds);
      await updateMafiaRoomStatus(roomId, 'playing');
      addGameLog(roomId, 'Game started. Roles assigned.');
    }
  }, [user, roomData, roomId]);

  const handleVote = useCallback(
    async (votedPlayerId: string) => {
      if (!user || !roomData || roomData.status !== 'voting' || !roomId) return;
      setMyVote(votedPlayerId);
      const roomRef = ref(db, `mafiaRooms/${roomId}/votes`);
      await update(roomRef, {[user.uid]: votedPlayerId});
      addGameLog(roomId, `${user.displayName} voted for ${roomData.players[votedPlayerId].displayName}.`);
    },
    [user, roomData, roomId]
  );

  const tallyVotesAndEliminatePlayer = useCallback(async () => {
    if (!roomData || !roomData.votes || !roomId) return;

    const voteCounts: Record<string, number> = {};
    for (const voterId in roomData.votes) {
      const votedPlayerId = roomData.votes[voterId];
      voteCounts[votedPlayerId] = (voteCounts[votedPlayerId] || 0) + 1;
    }

    let eliminatedPlayerId: string | null = null;
    let maxVotes = 0;
    for (const playerId in voteCounts) {
      if (voteCounts[playerId] > maxVotes) {
        maxVotes = voteCounts[playerId];
        eliminatedPlayerId = playerId;
      } else if (voteCounts[playerId] === maxVotes) {
        eliminatedPlayerId = null;
      }
    }

    if (eliminatedPlayerId) {
      await updatePlayerStatus(roomId, eliminatedPlayerId, false);
      alert(`${roomData.players[eliminatedPlayerId].displayName} has been eliminated!`);
      addGameLog(roomId, `${roomData.players[eliminatedPlayerId].displayName} was eliminated.`);

      const alivePlayers = Object.entries(roomData.players).filter(([, player]) => player.isAlive !== false);
      const aliveMafia = alivePlayers.filter(([, player]) => player.role === 'mafia').length;
      const aliveCitizens = alivePlayers.filter(([, player]) => player.role === 'citizen').length;

      if (aliveMafia === 0) {
        alert('Citizens win! All Mafia eliminated.');
        addGameLog(roomId, 'Game ended. Citizens win!');
        await updateMafiaRoomStatus(roomId, 'ended');
      } else if (aliveMafia >= aliveCitizens) {
        alert('Mafia win! Mafia outnumber or equal citizens.');
        addGameLog(roomId, 'Game ended. Mafia win!');
        await updateMafiaRoomStatus(roomId, 'ended');
      } else {
        await updateMafiaRoomStatus(roomId, 'discussion');
        addGameLog(roomId, 'Moving to next discussion phase.');
      }
    } else {
      alert('No one was eliminated due to a tie!');
      addGameLog(roomId, 'No one was eliminated due to a tie.');
      await updateMafiaRoomStatus(roomId, 'discussion');
      addGameLog(roomId, 'Moving to next discussion phase.');
    }
  }, [roomData, roomId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, timerActive]);

  useEffect(() => {
    if (timer === 0 && timerActive) {
      requestAnimationFrame(() => {
        setTimerActive(false);
      });
      if (roomData?.status === 'playing' && roomId) {
        updateMafiaRoomStatus(roomId, 'voting');
        addGameLog(roomId, 'Discussion time ended. Moving to voting phase.');
      } else if (roomData?.status === 'voting') {
        tallyVotesAndEliminatePlayer();
        addGameLog(roomId, 'Voting time ended. Tallying votes.');
      }
    }
  }, [timer, timerActive, roomData?.status, roomId, tallyVotesAndEliminatePlayer]);

  const playersArray = useMemo(() => {
    if (!roomData?.players) return [];
    return Object.entries(roomData.players).map(([id, player]) => ({
      id,
      ...player,
      isAlive: player.isAlive !== false
    }));
  }, [roomData?.players]);

  if (!roomId) {
    return <div className="text-center mt-8 text-red-500">Invalid or missing room id.</div>;
  }

  if (loading) {
    return <div className="text-center mt-8">Loading room...</div>;
  }

  if (!roomData) {
    return <div className="text-center mt-8 text-red-500">Room not found or has ended.</div>;
  }

  const alivePlayers = playersArray.filter((player) => player.isAlive);
  const isHost = user && user.uid === roomData.hostId;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Room: {roomId}</h1>
        {roomData.status === 'playing' && (
          <div className="text-2xl font-bold text-center text-red-600">Discussion Time Left: {timer}s</div>
        )}
        {roomData.status === 'voting' && (
          <div className="text-2xl font-bold text-center text-blue-600">Voting Time Left: {timer}s</div>
        )}
        <h2 className="text-xl font-semibold">Players ({alivePlayers.length} alive):</h2>
        <ul className="list-disc list-inside">
          {playersArray.map((player) => (
            <li key={player.id} className={!player.isAlive ? 'line-through text-gray-500' : ''}>
              {player.displayName}
              {user && user.uid === player.id && player.role && ` (You are ${player.role})`}
            </li>
          ))}
        </ul>

        {roomData.status === 'voting' && user && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Vote for someone to eliminate:</h3>
            <div className="grid grid-cols-2 gap-2">
              {alivePlayers
                .filter((player) => player.id !== user.uid)
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleVote(player.id)}
                    className={`px-4 py-2 rounded-md ${
                      myVote === player.id ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                    } hover:bg-red-600 hover:text-white`}
                  >
                    {player.displayName}
                  </button>
                ))}
            </div>
          </div>
        )}

        {isHost && roomData.status === 'waiting' && (
          <button
            onClick={handleStartGame}
            className="w-full px-4 py-2 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Start Game
          </button>
        )}

        {roomData.status === 'playing' && (
          <p className="text-center text-gray-700">
            Discussion phase is ongoing. Mafia and citizens can discuss who they think is suspicious.
          </p>
        )}
        {roomData.status === 'voting' && (
          <p className="text-center text-gray-700">
            Voting phase is active. Select a player to vote out. Highest votes will be eliminated.
          </p>
        )}

        {roomData.status === 'ended' && (
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800">Game has ended.</p>
            <p className="text-gray-600">You can return to the lobby to start a new game.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MafiaRoom;
