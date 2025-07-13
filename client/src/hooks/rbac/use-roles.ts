import { useCallback } from 'react';
import { UserRole } from '@/types';
import { inheritsRole, getInheritedRoles, canTransitionToRole, getPossibleTransitions } from '@/lib/rbac/role';
import { useAuth } from '@/hooks/auth/use-auth';

export function useRoles() {
  const { user } = useAuth();

  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.roles?.includes(role) || false;
  }, [user]);

  const hasInheritedRole = useCallback((role: UserRole): boolean => {
    if (!user?.roles) {
      return false;
    }
    return user.roles.some(userRole => inheritsRole(userRole as UserRole, role));
  }, [user]);

  const getAllInheritedRoles = useCallback((): UserRole[] => {
    if (!user?.roles) {
      return [];
    }
    return user.roles.flatMap(role => getInheritedRoles(role as UserRole));
  }, [user]);

  const canTransitionTo = useCallback((targetRole: UserRole): boolean => {
    if (!user?.roles) {
      return false;
    }
    return user.roles.some(role => canTransitionToRole(role as UserRole, targetRole));
  }, [user]);

  const getPossibleRoleTransitions = useCallback((): UserRole[] => {
    if (!user?.roles) {
      return [];
    }
    return user.roles.flatMap(role => getPossibleTransitions(role as UserRole));
  }, [user]);

  return {
    hasRole,
    hasInheritedRole,
    getAllInheritedRoles,
    canTransitionTo,
    getPossibleRoleTransitions,
    roles: user?.roles || []
  };
} 