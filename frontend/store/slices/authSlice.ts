import { create } from 'zustand';
import type { UserRole } from '@/frontend/types';

interface AuthState {
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  } | null;
  isLoading: boolean;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));