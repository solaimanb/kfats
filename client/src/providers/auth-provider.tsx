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
        const currentUser = await AuthAPI.verifyToken()
        setUser(currentUser)
        tokenUtils.setUser(currentUser)
      } else {
        tokenUtils.clearAuth()
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      tokenUtils.clearAuth()
      setUser(null)
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
      logout()
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
