import { useCallback } from 'react';
import { Permission, PermissionAction } from '../../config/rbac/types';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../../lib/rbac/permission';
import { useAuth } from '../auth/use-auth';

export function usePermissions() {
  const { user } = useAuth();

  const checkPermission = useCallback((
    resource: string,
    action: PermissionAction
  ): boolean => {
    if (!user?.permissions) {
      return false;
    }
    return hasPermission(user.permissions, resource, action);
  }, [user]);

  const checkAllPermissions = useCallback((
    permissions: Array<{ resource: string; action: PermissionAction }>
  ): boolean => {
    if (!user?.permissions) {
      return false;
    }
    return hasAllPermissions(user.permissions, permissions);
  }, [user]);

  const checkAnyPermission = useCallback((
    permissions: Array<{ resource: string; action: PermissionAction }>
  ): boolean => {
    if (!user?.permissions) {
      return false;
    }
    return hasAnyPermission(user.permissions, permissions);
  }, [user]);

  const getAllPermissions = useCallback((): Permission[] => {
    return user?.permissions || [];
  }, [user]);

  return {
    checkPermission,
    checkAllPermissions,
    checkAnyPermission,
    getAllPermissions,
    permissions: user?.permissions || []
  };
} 