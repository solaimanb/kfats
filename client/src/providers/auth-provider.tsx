"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'sonner'
import { User, UserRole, RegisterFormData } from '@/lib/types/api'
import { AuthAPI, tokenUtils } from '@/lib/api/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  register: (userData: RegisterFormData) => Promise<User>
  upgradeRole: (newRole: UserRole) => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = tokenUtils.getToken()
      const storedUser = tokenUtils.getUser()

      if (token && storedUser) {
        // Try to verify token, but don't logout on failure
        // Only verify if we have valid stored data
        try {
          const currentUser = await AuthAPI.verifyToken()
          setUser(currentUser)
          tokenUtils.setUser(currentUser)
        } catch (verifyError) {
          console.warn('Token verification failed during initialization, using stored user:', verifyError)
          // Use stored user data instead of logging out immediately
          // Let natural API calls handle auth failures later
          setUser(storedUser)
        }
      } else {
        tokenUtils.clearAuth()
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      // Don't clear auth on general initialization errors
      // Only clear if there's no stored data at all
      const storedUser = tokenUtils.getUser()
      if (!storedUser) {
        tokenUtils.clearAuth()
        setUser(null)
      } else {
        setUser(storedUser)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true)
      const authResponse = await AuthAPI.login({ email, password })

      tokenUtils.setToken(authResponse.access_token)
      tokenUtils.setUser(authResponse.user)
      setUser(authResponse.user)

      return authResponse.user
    } catch (error) {
      tokenUtils.clearAuth()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterFormData): Promise<User> => {
    try {
      setIsLoading(true)
      await AuthAPI.register(userData)

      const user = await login(userData.email, userData.password)
      return user
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    tokenUtils.clearAuth()
    toast.success("Logged out successfully")
    AuthAPI.logout()
  }

  const upgradeRole = async (newRole: UserRole) => {
    try {
      await AuthAPI.upgradeRole(newRole)
      await refetchUser()
    } catch (error) {
      throw error
    }
  }

  const refetchUser = async () => {
    try {
      const currentUser = await AuthAPI.verifyToken()
      setUser(currentUser)
      tokenUtils.setUser(currentUser)
    } catch (error) {
      console.error('Failed to refetch user:', error)
      // Only logout if it's actually an authentication error (401)
      // Don't logout on network errors or other API failures
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        logout()
      } else {
        // For other errors, just log them but don't logout
        console.warn('User verification failed, but not logging out:', error)
      }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    upgradeRole,
    refetchUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 *-----------------------------------
 * Custom hook to use the AuthContext
 *-----------------------------------
*/
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 *---------------------------------
 * Hook for checking specific roles
 *---------------------------------
*/
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, isAuthenticated, isLoading } = useAuth()

  const hasRequiredRole = requiredRole
    ? user?.role === requiredRole || user?.role === UserRole.ADMIN
    : isAuthenticated

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRequiredRole,
    canAccess: isAuthenticated && hasRequiredRole
  }
}

/*
 *-----------------------------------
 * Hook for role-based access control
 *-----------------------------------
*/
export function useRoleAccess() {
  const { user } = useAuth()

  return {
    isAdmin: user?.role === UserRole.ADMIN,
    isMentor: user?.role === UserRole.MENTOR || user?.role === UserRole.ADMIN,
    isStudent: user?.role === UserRole.STUDENT || user?.role === UserRole.ADMIN,
    isWriter: user?.role === UserRole.WRITER || user?.role === UserRole.ADMIN,
    isSeller: user?.role === UserRole.SELLER || user?.role === UserRole.ADMIN,
    canCreateCourses: user?.role === UserRole.MENTOR || user?.role === UserRole.ADMIN,
    canWriteArticles: user?.role === UserRole.WRITER || user?.role === UserRole.ADMIN,
    canSellProducts: user?.role === UserRole.SELLER || user?.role === UserRole.ADMIN,
    canManageUsers: user?.role === UserRole.ADMIN,
  }
}
