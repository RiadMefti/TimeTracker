import { create } from "zustand";
import type { User } from "firebase/auth";

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  resetUser: () => set({ user: null }),
}));
