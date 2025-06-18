import { UserRole, RoleConfig, Permission, PermissionAction } from "./types";
import {
  USER_PERMISSIONS,
  STUDENT_PERMISSIONS,
  MENTOR_PERMISSIONS,
  WRITER_PERMISSIONS,
  SELLER_PERMISSIONS,
  ADMIN_PERMISSIONS,
} from "./permissions";

export class RBACRoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RBACRoleError";
  }
}

/**
 * Role requirements for special roles
 */
export const ROLE_REQUIREMENTS: Partial<
  Record<
    UserRole,
    {
      requiredVerification: boolean;
      requiredDocuments: string[];
      minimumRequirements: {
        experience?: number;
        qualifications?: string[];
        reviews?: number;
        rating?: number;
      };
    }
  >
> = {
  [UserRole.MENTOR]: {
    requiredVerification: true,
    requiredDocuments: [
      "qualificationCertificate",
      "identityProof",
      "experienceLetter",
    ],
    minimumRequirements: {
      experience: 2, // 2 years
      qualifications: ["degree", "teachingCertification"],
      reviews: 0,
      rating: 0,
    },
  },
  [UserRole.WRITER]: {
    requiredVerification: true,
    requiredDocuments: ["writingSamples", "identityProof"],
    minimumRequirements: {
      experience: 1, // 1 year
      qualifications: ["contentWritingCertification"],
      reviews: 0,
      rating: 0,
    },
  },
  [UserRole.SELLER]: {
    requiredVerification: true,
    requiredDocuments: ["businessRegistration", "taxId", "bankDetails"],
    minimumRequirements: {
      experience: 0,
      reviews: 0,
      rating: 0,
    },
  },
};

/**
 * Role configuration with permissions and inheritance
 */
export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  [UserRole.ADMIN]: {
    permissions: ADMIN_PERMISSIONS,
  },
  [UserRole.MENTOR]: {
    permissions: MENTOR_PERMISSIONS,
    inherits: [UserRole.USER],
  },
  [UserRole.STUDENT]: {
    permissions: STUDENT_PERMISSIONS,
    inherits: [UserRole.USER],
  },
  [UserRole.WRITER]: {
    permissions: WRITER_PERMISSIONS,
    inherits: [UserRole.USER],
  },
  [UserRole.SELLER]: {
    permissions: SELLER_PERMISSIONS,
    inherits: [UserRole.USER],
  },
  [UserRole.USER]: {
    permissions: USER_PERMISSIONS,
  },
};

/**
 * Role transition rules - all professional roles require admin approval
 */
export const ROLE_TRANSITIONS: Record<
  UserRole,
  {
    possible: UserRole[];
    requiresApproval: boolean;
  }
> = {
  [UserRole.USER]: {
    possible: [UserRole.STUDENT],
    requiresApproval: false,
  },
  [UserRole.STUDENT]: {
    possible: [],
    requiresApproval: false,
  },
  [UserRole.MENTOR]: {
    possible: [],
    requiresApproval: true,
  },
  [UserRole.WRITER]: {
    possible: [],
    requiresApproval: true,
  },
  [UserRole.SELLER]: {
    possible: [],
    requiresApproval: true,
  },
  [UserRole.ADMIN]: {
    possible: [],
    requiresApproval: true,
  },
};

/**
 * Validate a role exists
 * @throws {RBACRoleError} If role is invalid
 */
export function validateRole(role: UserRole): boolean {
  if (!Object.values(UserRole).includes(role)) {
    throw new RBACRoleError(`Invalid role: ${role}`);
  }
  return true;
}

/**
 * Get all roles that can be upgraded to from a given role
 * @throws {RBACRoleError} If role is invalid
 */
export function getPossibleUpgrades(role: UserRole): UserRole[] {
  validateRole(role);
  return ROLE_TRANSITIONS[role]?.possible || [];
}

/**
 * Get all inherited roles for a given role
 * @throws {RBACRoleError} If role is invalid
 */
export function getInheritedRoles(role: UserRole): UserRole[] {
  validateRole(role);

  const config = ROLE_CONFIG[role];
  if (!config?.inherits) {
    return [];
  }

  const inheritedRoles = [...config.inherits];
  config.inherits.forEach((inheritedRole) => {
    validateRole(inheritedRole);
    inheritedRoles.push(...getInheritedRoles(inheritedRole));
  });

  return Array.from(new Set(inheritedRoles));
}

/**
 * Check if a role transition is valid
 * @throws {RBACRoleError} If either role is invalid
 */
export function isValidRoleTransition(
  fromRole: UserRole,
  toRole: UserRole
): boolean {
  validateRole(fromRole);
  validateRole(toRole);
  return ROLE_TRANSITIONS[fromRole]?.possible?.includes(toRole) || false;
}

/**
 * Get all roles that inherit from a given role
 * @throws {RBACRoleError} If role is invalid
 */
export function getInheritingRoles(role: UserRole): UserRole[] {
  validateRole(role);
  return Object.entries(ROLE_CONFIG)
    .filter(([_, config]) => config.inherits?.includes(role))
    .map(([r]) => r as UserRole);
}

/**
 * Check if a role has a specific permission
 * @throws {RBACRoleError} If role is invalid
 */
export function roleHasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  validateRole(role);
  const config = ROLE_CONFIG[role];
  if (!config) return false;

  return config.permissions.some(
    (p) =>
      p.resource === permission.resource &&
      (p.action === permission.action || p.action === PermissionAction.MANAGE)
  );
}
