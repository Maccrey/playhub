export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any; // Firebase Timestamp
  favoriteGames: string[];
  highScores: { [gameId: string]: number };
  sentRequests: string[];
  receivedRequests: { uid: string; displayName: string }[];
  gameStats: {
    [gameId: string]: {
      highScore: number;
      gamesPlayed: number;
      lastPlayed: string | null;
    };
  };
  friends?: { uid: string; displayName: string }[];
}
