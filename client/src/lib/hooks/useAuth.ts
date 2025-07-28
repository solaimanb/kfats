import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthAPI } from '../api/auth'
import { LoginFormData, RegisterFormData, UserRole } from '../types/api'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

/**
 * Hook to get current user
 */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: AuthAPI.verifyToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginFormData) => AuthAPI.login(credentials),
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(authKeys.me(), data.user)
      // Invalidate all auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
  })
}

/**
 * Hook for register mutation
 */
export function useRegister() {
  return useMutation({
    mutationFn: (userData: RegisterFormData) => AuthAPI.register(userData),
  })
}

/**
 * Hook for role upgrade mutation
 */
export function useRoleUpgrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newRole: UserRole) => AuthAPI.upgradeRole(newRole),
    onSuccess: () => {
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      AuthAPI.logout()
      return Promise.resolve()
    },
    onSuccess: () => {
      // Clear all caches
      queryClient.clear()
    },
  })
}
