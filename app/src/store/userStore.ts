

import { create } from 'zustand';
import { User } from '@/types/user';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  favoriteGames: string[];
  setFavoriteGames: (games: string[]) => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  favoriteGames: [],
  setFavoriteGames: (games) => set({ favoriteGames: games }),
}));

export default useUserStore;

