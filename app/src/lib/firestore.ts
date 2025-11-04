
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, orderBy, limit, getDocs, arrayUnion, arrayRemove } from "firebase/firestore";
import { User } from "firebase/auth";
import { app } from "./firebase";

const firestore = getFirestore(app);

const isFirebaseConfigured = Boolean(process.env.NEXT_PUBLIC_PROJECT_ID);
const warnedFeatures = new Set<string>();

const ensureFirebase = (feature: string) => {
  if (isFirebaseConfigured) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && !warnedFeatures.has(feature)) {
    console.warn(`[firebase-disabled] ${feature} skipped because Firebase is not configured.`);
    warnedFeatures.add(feature);
  }

  return false;
};

export const createUserProfileDocument = async (userAuth: User) => {
  if (!userAuth || !ensureFirebase('createUserProfileDocument')) return;

  const userRef = doc(firestore, "users", userAuth.uid);

  const { displayName, email, photoURL } = userAuth;
  const createdAt = serverTimestamp();

  try {
    await setDoc(userRef, {
      displayName,
      email,
      photoURL,
      createdAt,
      favoriteGames: [],
      highScores: {},
      sentRequests: [],
      receivedRequests: [],
    }, { merge: true }); // Use merge to avoid overwriting existing data
  } catch (error) {
    console.error("Error creating user profile", error);
  }
};

export const getUserProfileDocument = async (uid: string) => {
  if (!uid || !ensureFirebase('getUserProfileDocument')) return null;
  const userRef = doc(firestore, "users", uid);
  const userSnapshot = await getDoc(userRef);
  return userSnapshot.data();
};

export const updateUserHighScore = async (uid: string, gameId: string, score: number) => {
  if (!uid || !ensureFirebase('updateUserHighScore')) return;
  const userRef = doc(firestore, "users", uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const currentHighScores = userDoc.data().highScores || {};
    const currentHighScore = currentHighScores[gameId] || 0;

    if (score > currentHighScore) {
      try {
        await updateDoc(userRef, {
          [`highScores.${gameId}`]: score,
        });
      } catch (error) {
        console.error("Error updating high score", error);
      }
    }
  }
};

export const getGlobalRanking = async (gameId: string) => {
  if (!ensureFirebase('getGlobalRanking')) return [];
  const usersRef = collection(firestore, "users");
  const q = query(
    usersRef,
    orderBy(`highScores.${gameId}`, "desc"),
    limit(10)
  );

  try {
    const querySnapshot = await getDocs(q);
    const ranking = querySnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        displayName: data.displayName,
        score: data.highScores[gameId],
      };
    });
    return ranking;
  } catch (error) {
    console.error("Error getting global ranking", error);
    return [];
  }
};

import { ref, set, get, update, push, serverTimestamp as dbServerTimestamp, onValue, off } from "firebase/database";
import { db } from "./firebase";

export type MafiaRoomStatus = 'waiting' | 'playing' | 'discussion' | 'voting' | 'ended';

export type MafiaRoomPlayer = {
  displayName: string;
  role?: string;
  isAlive?: boolean;
};

export type MafiaRoomData = {
  hostId: string;
  name: string;
  status: MafiaRoomStatus;
  createdAt?: number;
  players: Record<string, MafiaRoomPlayer>;
  votes?: Record<string, string>;
  language?: string;
};

const SUPPORTED_LANGUAGES = ['en', 'ko', 'ja', 'zh'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const createMafiaRoom = async (hostId: string, name: string, language: string) => {
  if (!ensureFirebase('createMafiaRoom')) return null;
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random 6-character room ID
  const roomRef = ref(db, `mafiaRooms/${roomId}`);
  const trimmedName = name.trim();
  const normalizedLanguage = SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
    ? language
    : 'en';
  
  try {
    await set(roomRef, {
      hostId,
      name: trimmedName,
      createdAt: dbServerTimestamp(),
      players: {},
      status: 'waiting',
      language: normalizedLanguage,
    });
    return roomId;
  } catch (error) {
    console.error("Error creating mafia room", error);
    return null;
  }
};

export const joinMafiaRoom = async (roomId: string, userId: string, displayName: string) => {
  if (!ensureFirebase('joinMafiaRoom')) return false;
  const roomRef = ref(db, `mafiaRooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (roomSnapshot.exists()) {
    const roomData = roomSnapshot.val();
    if (roomData.status === 'waiting') {
      const updates: Record<string, {displayName: string}> = {};
      updates[`mafiaRooms/${roomId}/players/${userId}`] = {displayName};
      try {
        await update(ref(db), updates);
        return true;
      } catch (error) {
        console.error("Error joining mafia room", error);
        return false;
      }
    } else {
      console.log("Room is not in waiting state.");
      return false;
    }
  } else {
    console.log("Room does not exist.");
    return false;
  }
};

export const listenToMafiaRooms = (
  callback: (rooms: Record<string, MafiaRoomData> | null) => void
) => {
  if (!ensureFirebase('listenToMafiaRooms')) return () => undefined;
  const roomsRef = ref(db, 'mafiaRooms');
  const listener = onValue(roomsRef, (snapshot) => {
    callback(snapshot.val() as Record<string, MafiaRoomData> | null);
  });
  return () => off(roomsRef, 'value', listener);
};

export const updateMafiaRoomStatus = async (roomId: string, status: MafiaRoomStatus) => {
  if (!ensureFirebase('updateMafiaRoomStatus')) return false;
  const roomRef = ref(db, `mafiaRooms/${roomId}`);
  try {
    await update(roomRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating mafia room status", error);
    return false;
  }
};

export type MafiaDiscussionMessage = {
  authorId: string;
  authorName: string;
  message: string;
  timestamp?: number;
};

export const addMafiaDiscussionMessage = async (
  roomId: string,
  authorId: string,
  authorName: string,
  message: string
) => {
  if (!ensureFirebase('addMafiaDiscussionMessage')) return false;
  const messagesRef = ref(db, `mafiaRooms/${roomId}/discussionMessages`);
  try {
    await push(messagesRef, {
      authorId,
      authorName,
      message,
      timestamp: dbServerTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error adding mafia discussion message', error);
    return false;
  }
};

export const listenToMafiaDiscussionMessages = (
  roomId: string,
  callback: (messages: Record<string, MafiaDiscussionMessage> | null) => void
) => {
  if (!ensureFirebase('listenToMafiaDiscussionMessages')) return () => undefined;
  const messagesRef = ref(db, `mafiaRooms/${roomId}/discussionMessages`);
  const listener = onValue(messagesRef, (snapshot) => {
    callback(snapshot.val() as Record<string, MafiaDiscussionMessage> | null);
  });
  return () => off(messagesRef, 'value', listener);
};

export const assignMafiaRoles = async (roomId: string, playerIds: string[]) => {
  if (!ensureFirebase('assignMafiaRoles')) return false;
  const roomRef = ref(db, `mafiaRooms/${roomId}`);
  const roomSnapshot = await get(roomRef);

  if (!roomSnapshot.exists()) {
    console.error("Room does not exist.");
    return false;
  }

  const roomData = roomSnapshot.val();
  const players = roomData.players;

  // Simple role assignment: 1 Mafia for every 3-4 players, minimum 1 Mafia
  const numPlayers = playerIds.length;
  let numMafia = Math.max(1, Math.floor(numPlayers / 4));
  if (numPlayers < 4) numMafia = 1; // Ensure at least one mafia for small games
  if (numPlayers === 2) numMafia = 1; // Special case for 2 players

  const shuffledPlayerIds = [...playerIds].sort(() => Math.random() - 0.5);

  const newPlayersData: { [key: string]: { displayName: string; role: string } } = {};
  for (let i = 0; i < numPlayers; i++) {
    const playerId = shuffledPlayerIds[i];
    const role = i < numMafia ? 'mafia' : 'citizen';
    newPlayersData[playerId] = { ...players[playerId], role };
  }

  try {
    await update(roomRef, { players: newPlayersData });
    return true;
  } catch (error) {
    console.error("Error assigning mafia roles", error);
    return false;
  }
};

export const updatePlayerStatus = async (roomId: string, playerId: string, isAlive: boolean) => {
  if (!ensureFirebase('updatePlayerStatus')) return false;
  const playerRef = ref(db, `mafiaRooms/${roomId}/players/${playerId}`);
  try {
    await update(playerRef, { isAlive });
    return true;
  } catch (error) {
    console.error("Error updating player status", error);
    return false;
  }
};

export const addGameLog = async (roomId: string, message: string) => {
  if (!ensureFirebase('addGameLog')) return false;
  const logRef = ref(db, `mafiaRooms/${roomId}/logs`);
  try {
    await push(logRef, { message, timestamp: dbServerTimestamp() });
    return true;
  } catch (error) {
    console.error("Error adding game log", error);
    return false;
  }
};



export const toggleFavoriteGame = async (uid: string, gameId: string) => {
  if (!uid || !ensureFirebase('toggleFavoriteGame')) return;
  const userRef = doc(firestore, "users", uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const favoriteGames = userDoc.data().favoriteGames || [];
    if (favoriteGames.includes(gameId)) {
      await updateDoc(userRef, {
        favoriteGames: arrayRemove(gameId),
      });
    } else {
      await updateDoc(userRef, {
        favoriteGames: arrayUnion(gameId),
      });
    }
  }
};

export const sendFriendRequest = async (senderUid: string, receiverUid: string, senderDisplayName: string) => {
  if (!ensureFirebase('sendFriendRequest')) return false;
  if (senderUid === receiverUid) {
    console.error("Cannot send friend request to self.");
    return false;
  }

  const senderRef = doc(firestore, "users", senderUid);
  const receiverRef = doc(firestore, "users", receiverUid);

  try {
    // Check if already friends
    const senderDoc = await getDoc(senderRef);
    const receiverDoc = await getDoc(receiverRef);

    if (!senderDoc.exists() || !receiverDoc.exists()) {
      console.error("Sender or receiver does not exist.");
      return false;
    }

    const senderData = senderDoc.data();
    const receiverData = receiverDoc.data();

    if (senderData?.friends?.includes(receiverUid)) {
      console.log("Already friends.");
      return false;
    }

    // Check if request already sent or received
    if (senderData?.sentRequests?.includes(receiverUid) || receiverData?.receivedRequests?.includes(senderUid)) {
      console.log("Friend request already sent.");
      return false;
    }

    await updateDoc(senderRef, {
      sentRequests: arrayUnion(receiverUid),
    });
    await updateDoc(receiverRef, {
      receivedRequests: arrayUnion({ uid: senderUid, displayName: senderDisplayName }),
    });
    return true;
  } catch (error) {
    console.error("Error sending friend request", error);
    return false;
  }
};

export const acceptFriendRequest = async (accepterUid: string, senderUid: string, accepterDisplayName: string, senderDisplayName: string) => {
  if (!ensureFirebase('acceptFriendRequest')) return false;
  const accepterRef = doc(firestore, "users", accepterUid);
  const senderRef = doc(firestore, "users", senderUid);

  try {
    // Add to friends list for both
    await updateDoc(accepterRef, {
      friends: arrayUnion({ uid: senderUid, displayName: senderDisplayName }),
      receivedRequests: arrayRemove({ uid: senderUid, displayName: senderDisplayName }),
    });
    await updateDoc(senderRef, {
      friends: arrayUnion({ uid: accepterUid, displayName: accepterDisplayName }),
      sentRequests: arrayRemove(accepterUid),
    });
    return true;
  } catch (error) {
    console.error("Error accepting friend request", error);
    return false;
  }
};

export const rejectFriendRequest = async (rejecterUid: string, senderUid: string, senderDisplayName: string) => {
  if (!ensureFirebase('rejectFriendRequest')) return false;
  const rejecterRef = doc(firestore, "users", rejecterUid);
  const senderRef = doc(firestore, "users", senderUid);

  try {
    await updateDoc(rejecterRef, {
      receivedRequests: arrayRemove({ uid: senderUid, displayName: senderDisplayName }),
    });
    await updateDoc(senderRef, {
      sentRequests: arrayRemove(rejecterUid),
    });
    return true;
  } catch (error) {
    console.error("Error rejecting friend request", error);
    return false;
  }
};

export const getFriends = async (uid: string) => {
  if (!ensureFirebase('getFriends')) return [];
  const userProfile = await getUserProfileDocument(uid);
  return userProfile?.friends || [];
};

export const getSentRequests = async (uid: string) => {
  if (!ensureFirebase('getSentRequests')) return [];
  const userProfile = await getUserProfileDocument(uid);
  return userProfile?.sentRequests || [];
};

export const getReceivedRequests = async (uid: string) => {
  if (!ensureFirebase('getReceivedRequests')) return [];
  const userProfile = await getUserProfileDocument(uid);
  return userProfile?.receivedRequests || [];
};

export const getFriendRanking = async (uid: string, gameId: string) => {
  if (!ensureFirebase('getFriendRanking')) return [];
  const friendsList = await getFriends(uid);
  const friendRankings: { displayName: string; score: number }[] = [];

  for (const friend of friendsList) {
    const friendProfile = await getUserProfileDocument(friend.uid);
    if (friendProfile && friendProfile.highScores && friendProfile.highScores[gameId]) {
      friendRankings.push({
        displayName: friend.displayName,
        score: friendProfile.highScores[gameId],
      });
    }
  }

  return friendRankings.sort((a, b) => b.score - a.score);
};

export const updateGamePlayed = async (uid: string, gameId: string, score: number) => {
  if (!uid || !ensureFirebase('updateGamePlayed')) return;
  const userRef = doc(firestore, "users", uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const gameStats = userData.gameStats || {};

    const currentGameStats = gameStats[gameId] || {
      highScore: 0,
      gamesPlayed: 0,
      lastPlayed: null,
    };

    const updatedGamesPlayed = currentGameStats.gamesPlayed + 1;
    const updatedLastPlayed = new Date().toISOString();
    const updatedHighScore = Math.max(currentGameStats.highScore, score);

    try {
      await updateDoc(userRef, {
        [`gameStats.${gameId}.gamesPlayed`]: updatedGamesPlayed,
        [`gameStats.${gameId}.lastPlayed`]: updatedLastPlayed,
        [`gameStats.${gameId}.highScore`]: updatedHighScore,
      });
    } catch (error) {
      console.error("Error updating game played stats", error);
    }
  }
};
