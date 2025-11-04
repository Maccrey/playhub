
'use client';

import {useEffect, useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/navigation';
import {createMafiaRoom, joinMafiaRoom, listenToMafiaRooms, MafiaRoomStatus} from '@/lib/firestore';
import useUserStore from '@/store/userStore';

const Lobby = () => {
  type SupportedLanguage = 'en' | 'ko' | 'ja' | 'zh';

  type RoomSummary = {
    id: string;
    name: string;
    status: MafiaRoomStatus;
    playerCount: number;
    createdAt: number;
    language: string;
  };

  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  const t = useTranslations('Mafia');
  const locale = useLocale();
  const supportedLanguages: SupportedLanguage[] = ['en', 'ko', 'ja', 'zh'];
  const initialLanguage: SupportedLanguage = supportedLanguages.includes(locale as SupportedLanguage)
    ? (locale as SupportedLanguage)
    : 'en';
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const languageLabelMap: Record<SupportedLanguage | 'unknown', string> = {
    en: t('lobby.languages.en'),
    ko: t('lobby.languages.ko'),
    ja: t('lobby.languages.ja'),
    zh: t('lobby.languages.zh'),
    unknown: t('lobby.languages.unknown')
  };
  const lobbyStatusLabels: Record<MafiaRoomStatus, string> = {
    waiting: t('lobby.status.waiting'),
    playing: t('lobby.status.playing'),
    discussion: t('lobby.status.discussion'),
    voting: t('lobby.status.voting'),
    ended: t('lobby.status.ended')
  };
  const languageOptions = supportedLanguages.map((code) => ({
    value: code,
    label: languageLabelMap[code]
  }));

  const handleCreateRoom = async () => {
    if (!user) {
      window.alert(t('alerts.loginRequiredCreate'));
      return;
    }
    if (roomName.trim() === '') {
      window.alert(t('alerts.enterRoomName'));
      return;
    }
    const selectedLanguage = supportedLanguages.includes(language) ? language : initialLanguage;
    const newRoomId = await createMafiaRoom(user.uid, roomName, selectedLanguage);
    if (newRoomId) {
      window.alert(t('alerts.roomCreated', {code: newRoomId}));
      setRoomName('');
      setLanguage(selectedLanguage);
      router.push(`${pathname}?room=${newRoomId}`);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.alert(t('alerts.loginRequiredJoin'));
      return;
    }
    if (roomCode.trim() === '') {
      window.alert(t('alerts.enterRoomCode'));
      return;
    }

    const displayName = user.displayName || t('anonymous');
    const normalizedCode = roomCode.trim().toUpperCase();
    const success = await joinMafiaRoom(normalizedCode, user.uid, displayName);
    if (success) {
      router.push(`${pathname}?room=${normalizedCode}`);
    } else {
      window.alert(t('alerts.joinFailed'));
    }
  };

  useEffect(() => {
    const unsubscribe = listenToMafiaRooms((data) => {
      if (!data) {
        setRooms([]);
        return;
      }

      const parsed = Object.entries(data)
        .map(([id, room]) => {
          const players = room?.players ? Object.keys(room.players).length : 0;
          const createdAtValue = typeof room?.createdAt === 'number' ? room.createdAt : 0;
          const statusValue = (room?.status ?? 'waiting') as MafiaRoomStatus;
          const languageValue = typeof room?.language === 'string' ? room.language : 'unknown';
          return {
            id,
            name: room?.name?.trim() || id,
            status: statusValue,
            playerCount: players,
            createdAt: createdAtValue,
            language: languageValue
          };
        })
        .filter((room) => room.status === 'waiting')
        .sort((a, b) => b.createdAt - a.createdAt);

      setRooms(parsed);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleJoinExistingRoom = async (roomId: string) => {
    if (!user) {
      window.alert(t('alerts.loginRequiredJoin'));
      return;
    }

    const displayName = user.displayName || t('anonymous');
    const success = await joinMafiaRoom(roomId, user.uid, displayName);
    if (success) {
      router.push(`${pathname}?room=${roomId}`);
    } else {
      window.alert(t('alerts.joinFailed'));
    }
  };

  const noRoomsAvailable = rooms.length === 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">{t('title')}</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
              {t('lobby.roomNameLabel')}
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={t('lobby.roomNamePlaceholder')}
              className="w-full px-4 py-2 mt-1 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={32}
            />
          </div>
          <div>
            <label htmlFor="roomLanguage" className="block text-sm font-medium text-gray-700">
              {t('lobby.languageLabel')}
            </label>
            <select
              id="roomLanguage"
              value={language}
              onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
              className="w-full px-4 py-2 mt-1 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateRoom}
            className="w-full px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('createRoom')}
          </button>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full h-px bg-gray-300"></div>
          <div className="px-4 text-sm font-medium text-gray-500">{t('or')}</div>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div>
            <label htmlFor="roomCode" className="sr-only">Room Code</label>
            <input 
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder={t('codePlaceholder')}
              className="w-full px-4 py-2 text-lg text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={6}
            />
          </div>
          <button 
            type="submit"
            className="w-full px-4 py-2 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {t('joinRoom')}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">{t('lobby.roomsListTitle')}</h2>
          {noRoomsAvailable ? (
            <p className="text-gray-500 text-sm">{t('lobby.noRooms')}</p>
          ) : (
            <ul className="space-y-3">
              {rooms.map((room) => {
                const languageKey = (room.language ?? 'unknown') as SupportedLanguage | 'unknown';
                const languageName = languageLabelMap[languageKey] ?? languageLabelMap.unknown;
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => handleJoinExistingRoom(room.id)}
                      className="w-full flex flex-col items-start gap-1 px-4 py-3 text-left border border-gray-200 rounded-md hover:border-blue-500 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">{room.name}</span>
                        <span className="text-sm text-gray-500">{lobbyStatusLabels[room.status]}</span>
                      </div>
                      <span className="text-sm text-gray-600">{t('lobby.playersCount', {count: room.playerCount})}</span>
                      <span className="text-xs text-gray-500">{t('lobby.languageTag', {language: languageName})}</span>
                      <span className="text-xs text-gray-400">{t('room.codeLabel', {roomId: room.id})}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
