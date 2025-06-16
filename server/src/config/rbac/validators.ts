import { Permission, UserRole, ResourceType, PermissionAction } from "./types";
import { ROLE_CONFIG, ROLE_REQUIREMENTS, ROLE_TRANSITIONS } from "./roles";
import { isValidRole } from "./types";
import { hasPermission } from "./permissions";

export class RBACValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RBACValidationError";
  }
}

export interface RoleApplication {
  userId: string;
  targetRole: UserRole;
  documents: {
    type: string;
    url: string;
    verified: boolean;
  }[];
  qualifications: {
    type: string;
    institution: string;
    year: number;
    verified: boolean;
  }[];
  experience: {
    years: number;
    details: string;
    verified: boolean;
  };
}

/**
 * Validates a permission object
 */
export function validatePermission(permission: unknown): boolean {
  if (!permission || typeof permission !== "object") {
    return false;
  }

  const p = permission as Permission;

  return (
    typeof p.resource === "string" &&
    typeof p.action === "string" &&
    Object.values(ResourceType).includes(p.resource as ResourceType) &&
    Object.values(PermissionAction).includes(p.action as PermissionAction)
  );
}

/**
 * Validates role constraints
 */
export function validateRoleConstraints(roles: UserRole[]): boolean {
  // Must have at least one role
  if (!roles || roles.length === 0) return false;

  // All roles must be valid
  if (
    !roles.every((role: string) =>
      Object.values(UserRole).includes(role as UserRole)
    )
  ) {
    return false;
  }

  // Cannot have both ADMIN and other roles
  if (roles.includes(UserRole.ADMIN) && roles.length > 1) {
    return false;
  }

  // Cannot have both MENTOR and STUDENT roles
  if (roles.includes(UserRole.MENTOR) && roles.includes(UserRole.STUDENT)) {
    return false;
  }

  return true;
}

/**
 * Get error message for role constraint violation
 */
export function getRoleConstraintViolationMessage(
  role: UserRole | UserRole[],
  resource?: ResourceType,
  action?: PermissionAction
): string {
  // Handle array of roles case
  if (Array.isArray(role)) {
    if (role.includes(UserRole.ADMIN) && role.length > 1) {
      return "Admin role cannot be combined with other roles";
    }
    if (role.includes(UserRole.MENTOR) && role.includes(UserRole.STUDENT)) {
      return "Cannot have both Mentor and Student roles";
    }
    if (!role.every((r) => Object.values(UserRole).includes(r))) {
      return "One or more invalid roles specified";
    }
    return "";
  }

  // Handle single role permission check case
  if (resource && action) {
    const roleConfig = ROLE_CONFIG[role];
    if (!roleConfig) {
      return `Invalid role: ${role}`;
    }

    if (!hasPermission(roleConfig.permissions, resource, action)) {
      return `Role ${role} does not have permission to ${action} ${resource}`;
    }
  }

  return "";
}

/**
 * Validate role transition
 */
export function validateRoleTransition(
  fromRole: UserRole,
  toRole: UserRole
): boolean {
  // Check if roles are valid
  if (!isValidRole(fromRole) || !isValidRole(toRole)) {
    throw new RBACValidationError(`Invalid role: ${fromRole} or ${toRole}`);
  }

  // Check if transition is allowed
  const transitions = ROLE_CONFIG[fromRole]?.inherits || [];
  return transitions.includes(toRole);
}

/**
 * Validate role inheritance chain
 */
export function validateRoleInheritanceChain(role: UserRole): boolean {
  const visited = new Set<UserRole>();

  function checkCycle(currentRole: UserRole): boolean {
    if (visited.has(currentRole)) {
      return true;
    }

    visited.add(currentRole);
    const inherits = ROLE_CONFIG[currentRole]?.inherits || [];

    for (const inheritedRole of inherits) {
      if (checkCycle(inheritedRole)) {
        return true;
      }
    }

    visited.delete(currentRole);
    return false;
  }

  if (checkCycle(role)) {
    throw new RBACValidationError(
      `Circular inheritance detected for role: ${role}`
    );
  }

  return true;
}

/**
 * Validates a role application against requirements
 */
export function validateRoleApplication(application: RoleApplication): boolean {
  const requirements = ROLE_REQUIREMENTS[application.targetRole];
  if (!requirements) {
    throw new RBACValidationError(
      `No requirements defined for role: ${application.targetRole}`
    );
  }

  // Check required documents
  const hasAllDocuments = requirements.requiredDocuments.every((doc) =>
    application.documents.some((d) => d.type === doc)
  );
  if (!hasAllDocuments) {
    throw new RBACValidationError(
      `Missing required documents for ${application.targetRole}`
    );
  }

  // Check minimum requirements
  const { minimumRequirements } = requirements;

  if (
    minimumRequirements.experience &&
    application.experience.years < minimumRequirements.experience
  ) {
    throw new RBACValidationError(
      `Insufficient experience. Required: ${minimumRequirements.experience} years`
    );
  }

  if (minimumRequirements.qualifications) {
    const hasRequiredQualifications = minimumRequirements.qualifications.every(
      (qual) => application.qualifications.some((q) => q.type === qual)
    );
    if (!hasRequiredQualifications) {
      throw new RBACValidationError(
        `Missing required qualifications for ${application.targetRole}`
      );
    }
  }

  return true;
}

/**
 * Check if role transition requires approval
 */
export function requiresApproval(
  fromRole: UserRole,
  toRole: UserRole
): boolean {
  const transition = ROLE_TRANSITIONS[fromRole];
  if (!transition) return true;

  return transition.requiresApproval || !transition.possible.includes(toRole);
}
