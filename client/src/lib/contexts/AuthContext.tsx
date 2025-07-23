"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService, { User, LoginCredentials, SignupData } from '../services/authService';
import TokenService from '../services/tokenService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check token and try to refresh on mount
    const initAuth = async () => {
      try {
        // Try to get current user data
        const userData = await AuthService.getCurrentUser();
        if (userData) {
          setUser(userData);
        } else if (TokenService.getAccessToken()) {
          // If we have a token but no user data, try to refresh
          await AuthService.refreshToken();
          const refreshedUser = await AuthService.getCurrentUser();
          setUser(refreshedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        TokenService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const userData = await AuthService.login(credentials);
      setUser(userData);
      await new Promise(resolve => setTimeout(resolve, 0));
      router.replace('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      await AuthService.signup(data);
      router.push('/login?signup=success');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user data on error
      setUser(null);
      TokenService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth guard HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return <div>Loading...</div>; // Replace with your loading component
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 