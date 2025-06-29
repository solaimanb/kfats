import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context/auth-context';
import type { AuthContextType } from '@/types/domain/user/auth';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 