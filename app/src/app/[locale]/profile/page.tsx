
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useUserStore from '@/store/userStore';
import {
  getFriends,
  getSentRequests,
  getReceivedRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest
} from '@/lib/firestore';

interface FriendData {
  uid: string;
  displayName: string;
}

const ProfilePage = () => {
  const { user } = useUserStore();
  const router = useRouter();

  const [friends, setFriends] = useState<FriendData[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendData[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const fetchFriendData = useCallback(async () => {
    if (!user) return;

    setLoadingFriends(true);
    const [fetchedFriends, fetchedSentRequests, fetchedReceivedRequests] = await Promise.all([
      getFriends(user.uid),
      getSentRequests(user.uid),
      getReceivedRequests(user.uid)
    ]);
    setFriends(fetchedFriends);
    setSentRequests(fetchedSentRequests);
    setReceivedRequests(fetchedReceivedRequests);
    setLoadingFriends(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const timeoutId = setTimeout(() => {
      void fetchFriendData();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, router, fetchFriendData]);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    // In a real app, you'd query Firestore for users matching searchQuery
    // For now, let's simulate a search
    const allUsers = [
      { uid: 'user1', displayName: 'Test User 1' },
      { uid: 'user2', displayName: 'Test User 2' },
      { uid: 'user3', displayName: 'Test User 3' },
    ]; // Replace with actual user search from Firestore

    const results = allUsers.filter(u => 
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) && u.uid !== user?.uid
    );
    setSearchResults(results);
  };

  const handleSendRequest = async (receiverUid: string, receiverDisplayName: string) => {
    if (user) {
      const success = await sendFriendRequest(user.uid, receiverUid, user.displayName || 'Anonymous');
      if (success) {
        alert(`Friend request sent to ${receiverDisplayName}`);
        void fetchFriendData();
      } else {
        alert('Failed to send friend request.');
      }
    }
  };

  const handleAcceptRequest = async (senderUid: string, senderDisplayName: string) => {
    if (user) {
      const success = await acceptFriendRequest(user.uid, senderUid, user.displayName || 'Anonymous', senderDisplayName);
      if (success) {
        alert(`Accepted friend request from ${senderDisplayName}`);
        void fetchFriendData();
      } else {
        alert('Failed to accept friend request.');
      }
    }
  };

  const handleRejectRequest = async (senderUid: string, senderDisplayName: string) => {
    if (user) {
      const success = await rejectFriendRequest(user.uid, senderUid, senderDisplayName);
      if (success) {
        alert(`Rejected friend request from ${senderDisplayName}`);
        void fetchFriendData();
      } else {
        alert('Failed to reject friend request.');
      }
    }
  };

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex justify-center items-start mt-8">
      <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Profile</h1>
        <div className="space-y-4">
          <div className="flex justify-center">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt="User Avatar"
                width={96}
                height={96}
                className="rounded-full"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-lg text-gray-900">{user.displayName || 'Guest'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg text-gray-900">{user.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">UID</label>
            <p className="mt-1 text-lg text-gray-900">{user.uid}</p>
          </div>
        </div>

        <hr className="my-6" />

        <h2 className="text-xl font-bold text-gray-900">Friends</h2>
        <div className="space-y-4">
          {/* Friend Search */}
          <div>
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSearch}
              className="mt-2 w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Search
            </button>
            <div className="mt-2 space-y-2">
              {searchResults.map(result => (
                <div key={result.uid} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{result.displayName}</span>
                  <button 
                    onClick={() => handleSendRequest(result.uid, result.displayName)}
                    className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Friend List */}
          <div>
            <h3 className="text-lg font-semibold">My Friends</h3>
            {loadingFriends ? (
              <p>Loading friends...</p>
            ) : friends.length > 0 ? (
              <ul className="list-disc list-inside">
                {friends.map(friend => (
                  <li key={friend.uid}>{friend.displayName}</li>
                ))}
              </ul>
            ) : (
              <p>No friends yet.</p>
            )}
          </div>

          {/* Received Requests */}
          <div>
            <h3 className="text-lg font-semibold">Received Friend Requests</h3>
            {loadingFriends ? (
              <p>Loading requests...</p>
            ) : receivedRequests.length > 0 ? (
              <ul className="space-y-2">
                {receivedRequests.map(request => (
                  <li key={request.uid} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{request.displayName}</span>
                    <div>
                      <button 
                        onClick={() => handleAcceptRequest(request.uid, request.displayName)}
                        className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 mr-2"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(request.uid, request.displayName)}
                        className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pending requests.</p>
            )}
          </div>

          {/* Sent Requests */}
          <div>
            <h3 className="text-lg font-semibold">Sent Friend Requests</h3>
            {loadingFriends ? (
              <p>Loading sent requests...</p>
            ) : sentRequests.length > 0 ? (
              <ul className="list-disc list-inside">
                {sentRequests.map(requestUid => (
                  <li key={requestUid}>{requestUid} (Pending)</li> // Display UID for now
                ))}
              </ul>
            ) : (
              <p>No sent requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
