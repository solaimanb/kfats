import { expect } from 'chai';
import { UserRole, ResourceType, PermissionAction, Permission } from '../../config/rbac/types';
import { validatePermission, validateRoleConfig, validateRoleInheritance } from '../../config/rbac/validators';
import { ROLE_DEFINITIONS } from '../../config/rbac/roles';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../../config/rbac/permissions';
import { PermissionService } from '../../services/rbac/permission.service';
import { RoleService } from '../../services/rbac/role.service';

describe('RBAC Permissions', () => {
  describe('Permission Validation', () => {
    it('should validate correct permissions', () => {
      const validPermission: Permission = {
        resource: ResourceType.COURSE,
        action: PermissionAction.READ
      };
      expect(validatePermission(validPermission)).to.be.true;
    });

    it('should reject invalid permissions', () => {
      const invalidPermission = {
        resource: 'INVALID_RESOURCE',
        action: 'INVALID_ACTION'
      };
      expect(validatePermission(invalidPermission)).to.be.false;
    });
  });

  describe('Role Configuration', () => {
    it('should validate role inheritance', () => {
      // Test for circular dependencies
      expect(validateRoleInheritance(UserRole.STUDENT)).to.be.true;
      expect(validateRoleInheritance(UserRole.ADMIN)).to.be.true;
    });

    it('should validate role configurations', () => {
      Object.values(ROLE_DEFINITIONS).forEach(config => {
        expect(validateRoleConfig(config)).to.be.true;
      });
    });
  });

  describe('Permission Checking', () => {
    const userPermissions: Permission[] = [
      { resource: ResourceType.COURSE, action: PermissionAction.READ },
      { resource: ResourceType.USER, action: PermissionAction.READ }
    ];

    it('should check single permission correctly', () => {
      expect(hasPermission(userPermissions, ResourceType.COURSE, PermissionAction.READ)).to.be.true;
      expect(hasPermission(userPermissions, ResourceType.COURSE, PermissionAction.WRITE)).to.be.false;
    });

    it('should check multiple permissions correctly', () => {
      const requiredPermissions = [
        { resource: ResourceType.COURSE, action: PermissionAction.READ },
        { resource: ResourceType.USER, action: PermissionAction.READ }
      ];

      expect(hasAllPermissions(userPermissions, requiredPermissions)).to.be.true;
    });

    it('should check any permission correctly', () => {
      const somePermissions = [
        { resource: ResourceType.COURSE, action: PermissionAction.DELETE },
        { resource: ResourceType.USER, action: PermissionAction.READ }
      ];

      expect(hasAnyPermission(userPermissions, somePermissions)).to.be.true;
    });
  });

  describe('Permission Service', () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      roles: [UserRole.STUDENT],
      permissions: []
    };

    it('should check user permissions correctly', () => {
      expect(PermissionService.checkUserPermission(
        mockUser,
        ResourceType.COURSE,
        PermissionAction.READ
      )).to.be.true;
    });

    it('should get all user permissions', () => {
      const permissions = PermissionService.getUserPermissions(mockUser);
      expect(permissions).to.be.an('array');
      expect(permissions.length).to.be.greaterThan(0);
    });
  });

  describe('Role Service', () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      roles: [UserRole.USER],
      permissions: []
    };

    it('should check role upgrade conditions', () => {
      const canUpgrade = RoleService.canUpgradeRole(
        UserRole.USER,
        ResourceType.COURSE,
        PermissionAction.READ
      );
      expect(canUpgrade).to.equal(UserRole.STUDENT);
    });

    it('should get inherited roles', () => {
      const inheritedRoles = RoleService.getInheritedRoles(UserRole.STUDENT);
      expect(inheritedRoles).to.include(UserRole.USER);
    });

    it('should validate roles', () => {
      const roles = RoleService.validateRoles([UserRole.USER, UserRole.STUDENT]);
      expect(roles).to.have.lengthOf(2);
      expect(roles).to.include(UserRole.USER);
      expect(roles).to.include(UserRole.STUDENT);
    });
  });
}); 