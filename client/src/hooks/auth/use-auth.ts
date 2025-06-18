import { useContext } from 'react';
import { AuthContext } from '../../contexts/auth-context/auth-context';
import { AuthUser } from '../../types/api/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} 