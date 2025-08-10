import { apiClient, ApiResponse } from './client'
import {
  RegisterRequest,
  AuthToken,
  User,
  UserRole,
  LoginFormData,
  RegisterFormData
} from '../types/api'

export class AuthAPI {
  /**
   * User registration
   */
  static async register(userData: RegisterFormData): Promise<ApiResponse> {
    const registerData: RegisterRequest = {
      ...userData,
      confirm_password: userData.password,
      role: userData.role || 'user' as UserRole
    }

    const response = await apiClient.post<ApiResponse>('/auth/register', registerData)
    return response.data
  }

  /**
   * User login
   */
  static async login(credentials: LoginFormData): Promise<AuthToken> {
    const response = await apiClient.post<AuthToken>('/auth/login', credentials)
    return response.data
  }

  /**
   * OAuth2 compatible login
   */
  static async loginOAuth(formData: { username: string; password: string }): Promise<AuthToken> {
    const params = new URLSearchParams()
    params.set('username', formData.username)
    params.set('password', formData.password)
    const response = await apiClient.post<AuthToken>('/auth/login/oauth', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response.data
  }

  /**
   * Upgrade user role
   */
  static async upgradeRole(newRole: UserRole): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/auth/role-upgrade', {
      new_role: newRole
    })
    return response.data
  }

  /**
   * Verify token (implicit through API interceptor)
   */
  static async verifyToken(): Promise<User> {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  }

  /**
   * Logout (client-side)
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      document.cookie = 'kfats_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'kfats_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

      window.location.href = '/'
    }
  }
}

export const tokenUtils = {
  /**
   * Store authentication token
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      document.cookie = `kfats_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
    }
  },

  /**
   * Store user data
   */
  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      document.cookie = `kfats_user=${JSON.stringify(user)}; path=/; max-age=${30 * 24 * 60 * 60}`
      document.cookie = `kfats_role=${user.role}; path=/; max-age=${30 * 24 * 60 * 60}`
    }
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; kfats_token=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  },

  /**
   * Get stored user
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; kfats_user=`)
    if (parts.length === 2) {
      const userStr = parts.pop()?.split(';').shift()
      if (userStr) {
        try {
          return JSON.parse(userStr)
        } catch {
          return null
        }
      }
    }
    return null
  },

  /**
   * Remove all auth data
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      document.cookie = 'kfats_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'kfats_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'kfats_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
  }
}
