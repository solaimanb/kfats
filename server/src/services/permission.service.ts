import { ROLE_PERMISSIONS, UserRole } from '../config/rbac.config';
import { AppError } from '../utils/app-error.util';

export class PermissionService {
  async getAllPermissions() {
    return Object.values(ROLE_PERMISSIONS).flat();
  }

  async getRolePermissions(role: string) {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new AppError('Invalid role', 400);
    }
    return ROLE_PERMISSIONS[role as UserRole] || [];
  }

  async updateRolePermissions(role: string, permissions: string[]) {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new AppError('Invalid role', 400);
    }
    // In a real application, you would update the permissions in the database
    // For now, we'll just return the new permissions
    return permissions;
  }
}

export default new PermissionService(); 