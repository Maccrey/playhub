
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from '@/navigation';
import { createMafiaRoom, joinMafiaRoom } from '@/lib/firestore';
import useUserStore from '@/store/userStore';

const Lobby = () => {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();

  const handleCreateRoom = async () => {
    if (!user) {
      alert('You must be logged in to create a room.');
      return;
    }
    const newRoomId = await createMafiaRoom(user.uid);
    if (newRoomId) {
      alert(`Room created with code: ${newRoomId}`);
      router.push(`${pathname}?room=${newRoomId}`);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to join a room.');
      return;
    }
    if (roomCode.trim() === '') {
      alert('Please enter a room code.');
      return;
    }

    const success = await joinMafiaRoom(roomCode, user.uid, user.displayName || 'Anonymous');
    if (success) {
      router.push(`${pathname}?room=${roomCode}`);
    } else {
      alert('Failed to join room. Please check the room code or try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Mafia Game</h1>
        
        <div className="space-y-4">
          <button 
            onClick={handleCreateRoom}
            className="w-full px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Room
          </button>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full h-px bg-gray-300"></div>
          <div className="px-4 text-sm font-medium text-gray-500">OR</div>
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
              placeholder="Enter Room Code"
              className="w-full px-4 py-2 text-lg text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={6}
            />
          </div>
          <button 
            type="submit"
            className="w-full px-4 py-2 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
