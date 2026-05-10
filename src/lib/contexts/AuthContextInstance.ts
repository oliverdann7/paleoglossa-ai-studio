import { createContext } from 'react';
import { User } from 'firebase/auth';

export interface UserStats {
  totalKnown: number;
  readToday: number;
  readingTime: number;
  lastActive: string;
  streak: number;
  freezesTotal: number;
  freezesUsed: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  stats: UserStats | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoMode: false,
  setDemoMode: () => {},
  stats: null,
});
