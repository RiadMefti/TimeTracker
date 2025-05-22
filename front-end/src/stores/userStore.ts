import { create } from "zustand";
import type { User } from "firebase/auth";

interface UserStore {
  user: User | null;
  authInitialized: boolean;
  setUser: (user: User | null) => void;
  resetUser: () => void;
  setAuthInitialized: (initialized: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  authInitialized: false,
  setUser: (user) => set({ user }),
  resetUser: () => set({ user: null }),
  setAuthInitialized: (authInitialized) => set({ authInitialized }),
}));
