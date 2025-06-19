 # RBAC Configuration Guide

## Overview
This directory contains the Role-Based Access Control (RBAC) configuration for the application. The system is designed to be flexible, maintainable, and consistent between server and client implementations.

## Structure

```
/server/src/config/rbac/
├── types.ts           # Core RBAC types
├── permissions.ts     # Permission definitions
├── roles.ts          # Role configurations
├── validators.ts     # Permission validators
└── version.ts        # Version control
```

## Client-Side Sync
When updating these configurations, ensure the following files are updated in the client:

1. `/client/src/config/rbac/types.ts`
2. `/client/src/config/rbac/permissions.ts`
3. `/client/src/config/rbac/roles.ts`

## Role Hierarchy
```
ADMIN
└── All permissions

MENTOR
├── Course management
└── USER permissions

STUDENT (Auto-upgrade from USER)
├── Course access
└── USER permissions

WRITER
├── Article management
└── USER permissions

SELLER
├── Product management
└── USER permissions

USER
└── Basic read permissions
```

## Automatic Role Upgrades
The system supports automatic role upgrades based on access patterns:
- USER → STUDENT: When attempting to access course resources

## Version Control
The RBAC system uses semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes that require client updates
- MINOR: Backwards-compatible feature additions
- PATCH: Backwards-compatible bug fixes

## Implementation Notes

### Permissions
- Each permission consists of a resource and an action
- The MANAGE action implies all other actions
- Permissions can have optional conditions

### Roles
- Roles can inherit permissions from other roles
- Circular inheritance is prevented
- Roles can be automatically upgraded based on conditions

### Validation
- All permissions and roles are validated at runtime
- Type safety is enforced throughout the system
- Version compatibility is checked during authentication

## API Contract
The authentication API includes RBAC information:
```typescript
interface AuthResponse {
  user: {
    id: string;
    roles: UserRole[];
    permissions: Permission[];
  };
  token: string;
  rbacVersion: string;
}
```

## Testing
Test files are located in:
- Server: `/server/src/tests/rbac/`
- Client: `/client/src/tests/rbac/`

## Best Practices
1. Always update both server and client configurations
2. Increment version number for breaking changes
3. Use type guards for runtime validation
4. Test permission changes thoroughly
5. Document new roles and permissions