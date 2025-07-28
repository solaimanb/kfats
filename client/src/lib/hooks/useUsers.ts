import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UsersAPI } from '../api/users'
import { UserRole } from '../types/api'

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
 * Hook to get all users (admin only)
 */
export function useUsers(params?: {
  page?: number
  size?: number
  role?: UserRole
  status?: string
  search?: string
}) {
  return useQuery({
    queryKey: usersKeys.list(params || {}),
    queryFn: () => UsersAPI.getAllUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) })
      queryClient.invalidateQueries({ queryKey: usersKeys.me() })
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
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: usersKeys.me() })
    },
  })
}
