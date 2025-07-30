import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UsersAPI } from '../api/users'
import { UserRole } from '../types/api'
import { toast } from 'sonner'

// Query keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...usersKeys.lists(), { filters }] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
  me: () => [...usersKeys.all, 'me'] as const,
}

/**
 * Hook to get current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: usersKeys.me(),
    queryFn: UsersAPI.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get all users (admin only) with optimized pagination
 */
export function useUsers(params?: {
  skip?: number
  limit?: number
  role?: string
  status?: string
}) {
  return useQuery({
    queryKey: usersKeys.list(params || {}),
    queryFn: () => UsersAPI.getAllUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for more fresh data
    gcTime: 5 * 60 * 1000, // Keep cached data for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if cache exists
    placeholderData: (previousData) => previousData, // Keep showing previous data while loading
  })
}

/**
 * Hook to get a specific user by ID
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => UsersAPI.getUserById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to update user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      UsersAPI.updateUserRole(userId, role.toString()),
    onSuccess: (data, variables) => {
      toast.success('User role updated successfully')
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) })
      queryClient.invalidateQueries({ queryKey: usersKeys.me() })
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user role: ${error.message}`)
    },
  })
}

/**
 * Hook to toggle user status (activate/deactivate)
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => UsersAPI.toggleUserStatus(userId),
    onSuccess: (data, userId) => {
      toast.success('User status updated successfully')
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) })
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user status: ${error.message}`)
    },
  })
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => UsersAPI.deleteUser(userId),
    onSuccess: (data, userId) => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) })
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`)
    },
  })
}

/**
 * Hook to update current user profile
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: Partial<Parameters<typeof UsersAPI.updateCurrentUser>[0]>) =>
      UsersAPI.updateCurrentUser(userData),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: usersKeys.me() })
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`)
    },
  })
}
