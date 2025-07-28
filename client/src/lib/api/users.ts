import { apiClient } from './client'
import { User, PaginatedResponse } from '../types/api'

export class UsersAPI {
  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  }

  /**
   * Update current user profile
   */
  static async updateCurrentUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/users/me', userData)
    return response.data
  }

  /**
   * Get all users (Admin only)
   */
  static async getAllUsers(params?: {
    page?: number
    size?: number
    role?: string
    status?: string
  }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users/', {
      params
    })
    return response.data
  }

  /**
   * Update user role (Admin only)
   */
  static async updateUserRole(userId: number, role: string): Promise<User> {
    const response = await apiClient.put<User>(`/users/${userId}/role`, { role })
    return response.data
  }

  /**
   * Get user by ID (Admin only)
   */
  static async getUserById(userId: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`)
    return response.data
  }
}
