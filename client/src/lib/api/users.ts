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
   * Get paginated users list (Admin only)
   */
  static async getAllUsers(params?: {
    skip?: number
    limit?: number
    role?: string
    status?: string
    email?: string
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams()

    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString())
    if (params?.role) searchParams.set('role', params.role)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.email) searchParams.set('email', params.email)

    const response = await apiClient.get<PaginatedResponse<User>>(`/users?${searchParams.toString()}`)
    return response.data
  }

  /**
   * Update user role (Admin only)
   */
  static async updateUserRole(userId: number, newRole: string): Promise<{ message: string; data?: unknown }> {
    const response = await apiClient.put(`/users/${userId}/role`, { new_role: newRole })
    return response.data
  }

  /**
   * Toggle user active status (Admin only)
   */
  static async toggleUserStatus(userId: number): Promise<{ message: string }> {
    const response = await apiClient.put(`/users/${userId}/toggle-status`)
    return response.data
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/users/${userId}`)
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
