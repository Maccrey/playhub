'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {off, onValue, ref, update} from 'firebase/database';
import {db} from '@/lib/firebase';
import useUserStore from '@/store/userStore';
import {
  addGameLog,
  assignMafiaRoles,
  updateMafiaRoomStatus,
  updatePlayerStatus,
  MafiaRoomStatus,
  addMafiaDiscussionMessage,
  listenToMafiaDiscussionMessages,
  MafiaDiscussionMessage
} from '@/lib/firestore';

interface Player {
  displayName: string;
  role?: string;
  isAlive?: boolean;
}

interface RoomData {
  hostId: string;
  name?: string;
  players: Record<string, Player>;
  status: MafiaRoomStatus;
  votes?: Record<string, string>;
  createdAt?: number;
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
  const [discussionInput, setDiscussionInput] = useState('');
  const [discussionError, setDiscussionError] = useState<string | null>(null);
  const [discussionMessages, setDiscussionMessages] = useState<Array<MafiaDiscussionMessage & {id: string}>>([]);
  const t = useTranslations('Mafia');
  const MESSAGE_MAX_LENGTH = 200;

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

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const unsubscribe = listenToMafiaDiscussionMessages(roomId, (data) => {
      if (!data) {
        setDiscussionMessages([]);
        return;
      }

      const parsed = Object.entries(data)
        .map(([id, message]) => ({
          id,
          ...message
        }))
        .sort((a, b) => {
          const timeA = typeof a.timestamp === 'number' ? a.timestamp : 0;
          const timeB = typeof b.timestamp === 'number' ? b.timestamp : 0;
          return timeA - timeB;
        });

      setDiscussionMessages(parsed);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [roomId]);

  const handleStartGame = useCallback(async () => {
    if (user && roomData && user.uid === roomData.hostId && roomId) {
      const playerIds = Object.keys(roomData.players);
      await assignMafiaRoles(roomId, playerIds);
      await updateMafiaRoomStatus(roomId, 'playing');
      addGameLog(roomId, t('room.logs.gameStarted'));
    }
  }, [user, roomData, roomId, t]);

  const handleVote = useCallback(
    async (votedPlayerId: string) => {
      if (!user || !roomData || roomData.status !== 'voting' || !roomId) return;
      setMyVote(votedPlayerId);
      const roomRef = ref(db, `mafiaRooms/${roomId}/votes`);
      await update(roomRef, {[user.uid]: votedPlayerId});
      const voterName = user.displayName || t('anonymous');
      const targetName = roomData.players[votedPlayerId].displayName;
      addGameLog(roomId, t('room.logs.playerVoted', {voter: voterName, target: targetName}));
    },
    [user, roomData, roomId, t]
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
      const eliminatedName = roomData.players[eliminatedPlayerId].displayName;
      await updatePlayerStatus(roomId, eliminatedPlayerId, false);
      window.alert(t('alerts.playerEliminated', {name: eliminatedName}));
      addGameLog(roomId, t('room.logs.playerEliminated', {name: eliminatedName}));

      const alivePlayers = Object.entries(roomData.players).filter(([, player]) => player.isAlive !== false);
      const aliveMafia = alivePlayers.filter(([, player]) => player.role === 'mafia').length;
      const aliveCitizens = alivePlayers.filter(([, player]) => player.role === 'citizen').length;

      if (aliveMafia === 0) {
        window.alert(t('alerts.citizensWin'));
        addGameLog(roomId, t('room.logs.citizensWin'));
        await updateMafiaRoomStatus(roomId, 'ended');
      } else if (aliveMafia >= aliveCitizens) {
        window.alert(t('alerts.mafiaWin'));
        addGameLog(roomId, t('room.logs.mafiaWin'));
        await updateMafiaRoomStatus(roomId, 'ended');
      } else {
        await updateMafiaRoomStatus(roomId, 'discussion');
        addGameLog(roomId, t('room.logs.discussionNext'));
      }
    } else {
      window.alert(t('alerts.tie'));
      addGameLog(roomId, t('room.logs.tie'));
      await updateMafiaRoomStatus(roomId, 'discussion');
      addGameLog(roomId, t('room.logs.discussionNext'));
    }
  }, [roomData, roomId, t]);

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
        addGameLog(roomId, t('room.logs.discussionEnded'));
      } else if (roomData?.status === 'voting') {
        tallyVotesAndEliminatePlayer();
        if (roomId) {
          addGameLog(roomId, t('room.logs.votingEnded'));
        }
      }
    }
  }, [timer, timerActive, roomData?.status, roomId, tallyVotesAndEliminatePlayer, t]);

  const playersSource = roomData?.players ?? null;

  const playersArray = useMemo(() => {
    if (!playersSource) return [];
    return Object.entries(playersSource).map(([id, player]) => ({
      id,
      ...player,
      isAlive: player.isAlive !== false
    }));
  }, [playersSource]);

  const getRoleLabel = useCallback(
    (role?: string) => {
      if (!role) return '';
      if (role === 'mafia') return t('room.roles.mafia');
      if (role === 'citizen') return t('room.roles.citizen');
      return role;
    },
    [t]
  );

  const roomStatus = roomData?.status ?? null;
  const isDiscussionPhase = roomStatus === 'playing' || roomStatus === 'discussion';
  const canSendDiscussionMessage = Boolean(user && roomId && isDiscussionPhase);

  const handleDiscussionSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      if (!roomId) {
        return;
      }

      if (!user) {
        window.alert(t('alerts.loginRequiredJoin'));
        return;
      }

      if (!isDiscussionPhase) {
        setDiscussionError(t('room.discussion.unavailable'));
        return;
      }

      const trimmed = discussionInput.trim();
      if (trimmed.length === 0) {
        setDiscussionError(t('room.discussion.empty'));
        return;
      }

      if (trimmed.length > MESSAGE_MAX_LENGTH) {
        setDiscussionError(t('room.discussion.tooLong', {max: MESSAGE_MAX_LENGTH}));
        return;
      }

      const displayName = user.displayName || t('anonymous');
      const success = await addMafiaDiscussionMessage(roomId, user.uid, displayName, trimmed);

      if (success) {
        setDiscussionInput('');
        setDiscussionError(null);
      }
    },
    [roomId, user, isDiscussionPhase, discussionInput, MESSAGE_MAX_LENGTH, t]
  );

  if (!roomId) {
    return <div className="text-center mt-8 text-red-500">{t('room.invalid')}</div>;
  }

  if (loading) {
    return <div className="text-center mt-8">{t('room.loading')}</div>;
  }

  if (!roomData) {
    return <div className="text-center mt-8 text-red-500">{t('room.notFound')}</div>;
  }

  const alivePlayers = playersArray.filter((player) => player.isAlive);
  const isHost = user && user.uid === roomData.hostId;
  const roomTitle = roomData.name?.trim() ? roomData.name.trim() : t('room.label', {roomId});
  const roomCodeLabel = t('room.codeLabel', {roomId});
  const roomStatusLabels: Record<MafiaRoomStatus, string> = {
    waiting: t('room.statusLabels.waiting'),
    playing: t('room.statusLabels.playing'),
    discussion: t('room.statusLabels.discussion'),
    voting: t('room.statusLabels.voting'),
    ended: t('room.statusLabels.ended')
  };
  const statusLabel = roomStatusLabels[roomData.status];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">{roomTitle}</h1>
        <p className="text-sm text-center text-gray-500">{roomCodeLabel}</p>
        <p className="text-sm text-center text-gray-500">{statusLabel}</p>
        {roomData.status === 'playing' && (
          <div className="text-2xl font-bold text-center text-red-600">{t('room.discussionTimer', {seconds: timer})}</div>
        )}
        {roomData.status === 'voting' && (
          <div className="text-2xl font-bold text-center text-blue-600">{t('room.votingTimer', {seconds: timer})}</div>
        )}
        <h2 className="text-xl font-semibold">{t('room.playersHeading', {count: alivePlayers.length})}</h2>
        <ul className="list-disc list-inside">
          {playersArray.map((player) => (
            <li key={player.id} className={!player.isAlive ? 'line-through text-gray-500' : ''}>
              {player.displayName}
              {user && user.uid === player.id && player.role && (
                <span>{t('room.roleSuffix', {role: getRoleLabel(player.role)})}</span>
              )}
            </li>
          ))}
        </ul>

        {roomData.status === 'voting' && user && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">{t('room.votePrompt')}</h3>
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
            {t('room.startGame')}
          </button>
        )}

        {roomData.status === 'playing' && (
          <p className="text-center text-gray-700">{t('room.discussionInfo')}</p>
        )}
        {roomData.status === 'voting' && (
          <p className="text-center text-gray-700">{t('room.votingInfo')}</p>
        )}

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{t('room.discussion.title')}</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
            {discussionMessages.length === 0 ? (
              <p className="text-sm text-gray-500">{t('room.discussion.noMessages')}</p>
            ) : (
              <ul className="space-y-2">
                {discussionMessages.map((message) => {
                  const timestampLabel =
                    typeof message.timestamp === 'number'
                      ? new Date(message.timestamp).toLocaleTimeString()
                      : '';
                  return (
                    <li key={message.id} className="bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{message.authorName}</span>
                        {timestampLabel && <span className="text-xs text-gray-400">{timestampLabel}</span>}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{message.message}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {user && (
            <form className="space-y-2" onSubmit={handleDiscussionSubmit}>
              <textarea
                value={discussionInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setDiscussionInput(value);
                  if (discussionError && value.trim().length <= MESSAGE_MAX_LENGTH) {
                    setDiscussionError(null);
                  }
                }}
                placeholder={t('room.discussion.placeholder')}
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={MESSAGE_MAX_LENGTH}
                rows={3}
                disabled={!canSendDiscussionMessage}
              />
              {discussionError && <p className="text-sm text-red-500">{discussionError}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {discussionInput.trim().length}/{MESSAGE_MAX_LENGTH}
                </span>
                <button
                  type="submit"
                  disabled={!canSendDiscussionMessage}
                  className={`px-4 py-2 text-sm font-semibold rounded-md text-white ${
                    canSendDiscussionMessage ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500' : 'bg-gray-400'
                  }`}
                >
                  {t('room.discussion.send')}
                </button>
              </div>
              {!canSendDiscussionMessage && (
                <p className="text-xs text-gray-500">{t('room.discussion.unavailable')}</p>
              )}
            </form>
          )}
        </div>

        {roomData.status === 'ended' && (
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800">{t('room.endedTitle')}</p>
            <p className="text-gray-600">{t('room.endedDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MafiaRoom;
