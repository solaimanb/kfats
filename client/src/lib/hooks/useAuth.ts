import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthAPI } from '../api/auth'
import { LoginFormData, RegisterFormData, UserRole } from '../types/api'

// Query keys for cache management
export const authQueryKeys = {
  all: ['auth'] as const,
  me: () => [...authQueryKeys.all, 'me'] as const,
}

/**
 * Hook for login mutation
 * Used by login forms
 */
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginFormData) => AuthAPI.login(credentials),
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(authQueryKeys.me(), data.user)
      // Invalidate all auth queries
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
    },
  })
}

/**
 * Hook for register mutation
 * Used by signup forms
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (userData: RegisterFormData) => AuthAPI.register(userData),
  })
}

/**
 * Hook for role upgrade mutation
 * Used for role applications
 */
export function useRoleUpgradeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetRole: UserRole) => AuthAPI.upgradeRole(targetRole),
    onSuccess: () => {
      // Invalidate user data to refetch updated role
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me() })
    },
  })
}