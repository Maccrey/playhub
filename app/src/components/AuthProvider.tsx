
'use client';

import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import useUserStore from '@/store/userStore';
import { createUserProfileDocument, getUserProfileDocument } from '@/lib/firestore';
import { User } from '@/types/user';

const auth = getAuth(app);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setFavoriteGames } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createUserProfileDocument(user);
        const userProfile = await getUserProfileDocument(user.uid);
        if (userProfile) {
          const appUser: User = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: user.metadata.creationTime,
            favoriteGames: userProfile.favoriteGames || [],
            highScores: userProfile.highScores || {},
            sentRequests: userProfile.sentRequests || [],
            receivedRequests: userProfile.receivedRequests || [],
            gameStats: userProfile.gameStats || {},
            friends: userProfile.friends || [],
          };
          setUser(appUser);
          setFavoriteGames(userProfile.favoriteGames || []);
        }
      } else {
        setUser(null);
        setFavoriteGames([]);
      }
    });

    return () => unsubscribe();
  }, [setUser, setFavoriteGames]);

  return <>{children}</>;
};

export default AuthProvider;
