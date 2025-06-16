import { useCallback } from 'react';
import { UserRole } from '../../config/rbac/types';
import { inheritsRole, getInheritedRoles, canTransitionToRole, getPossibleTransitions } from '../../lib/rbac/role';
import { useAuth } from '../auth/use-auth';

export function useRoles() {
  const { user } = useAuth();

  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.roles?.includes(role) || false;
  }, [user]);

  const hasInheritedRole = useCallback((role: UserRole): boolean => {
    if (!user?.roles) {
      return false;
    }
    return user.roles.some(userRole => inheritsRole(userRole, role));
  }, [user]);

  const getAllInheritedRoles = useCallback((): UserRole[] => {
    if (!user?.roles) {
      return [];
    }
    return user.roles.flatMap(role => getInheritedRoles(role));
  }, [user]);

  const canTransitionTo = useCallback((targetRole: UserRole): boolean => {
    if (!user?.roles) {
      return false;
    }
    return user.roles.some(role => canTransitionToRole(role, targetRole));
  }, [user]);

  const getPossibleRoleTransitions = useCallback((): UserRole[] => {
    if (!user?.roles) {
      return [];
    }
    return user.roles.flatMap(role => getPossibleTransitions(role));
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