import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context/auth-context';
import {
  ResourceType,
  PermissionAction,
  Permission,
  UserRole,
  RBACContextType
} from '@/types/rbac';

export function useRBAC(): RBACContextType {
  const { user } = useAuth();

  const checkPermission = useCallback(
    (resource: ResourceType, action: PermissionAction): boolean => {
      if (!user?.permissions) return false;

      return user.permissions.some(
        (p) =>
          p.resource === resource &&
          (p.action === action || p.action === PermissionAction.MANAGE)
      );
    },
    [user]
  );

  const checkAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user?.permissions) return false;

      return permissions.some(({ resource, action }) =>
        checkPermission(resource, action)
      );
    },
    [user, checkPermission]
  );

  const checkAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user?.permissions) return false;

      return permissions.every(({ resource, action }) =>
        checkPermission(resource, action)
      );
    },
    [user, checkPermission]
  );

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user?.roles) return false;
      return user.roles.includes(role);
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user?.roles) return false;
      return roles.some((role) => user.roles.includes(role));
    },
    [user]
  );

  const hasAllRoles = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user?.roles) return false;
      return roles.every((role) => user.roles.includes(role));
    },
    [user]
  );

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles
  };
} 