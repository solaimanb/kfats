import { apiClient, ApiResponse } from './client'
import {
  RegisterRequest,
  AuthToken,
  User,
  UserRole,
  LoginFormData,
  RegisterFormData
} from '../types/api'
import Cookies from 'js-cookie'

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
      Cookies.remove('kfats_token', { path: '/' })
      Cookies.remove('kfats_user', { path: '/' })
      Cookies.remove('kfats_role', { path: '/' })
      window.location.href = '/'
    }
  }
}

export const tokenUtils = {
  /**
   * Store authentication token
   */
  setToken(token: string): void {
    Cookies.set('kfats_token', token, { expires: 7, path: '/' })
  },

  /**
   * Store user data
   */
  setUser(user: User): void {
    Cookies.set('kfats_user', JSON.stringify(user), { expires: 30, path: '/' })
    Cookies.set('kfats_role', user.role, { expires: 30, path: '/' })
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return Cookies.get('kfats_token') || null
  },

  /**
   * Get stored user
   */
  getUser(): User | null {
    const userStr = Cookies.get('kfats_user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  },

  /**
   * Remove all auth data
   */
  clearAuth(): void {
    Cookies.remove('kfats_token', { path: '/' })
    Cookies.remove('kfats_user', { path: '/' })
    Cookies.remove('kfats_role', { path: '/' })
  }
}
