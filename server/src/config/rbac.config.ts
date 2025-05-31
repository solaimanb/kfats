export enum UserRole {
  ADMIN = "admin",
  MENTOR = "mentor",
  STUDENT = "student",
  WRITER = "writer",
  SELLER = "seller",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
  BANNED = "banned",
}

export enum ApplicationStatus {
  PENDING = "pending",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: [], // Admin is top level, inherits nothing
  [UserRole.MENTOR]: [UserRole.STUDENT], // Mentor inherits Student permissions
  [UserRole.WRITER]: [UserRole.STUDENT], // Writer inherits Student permissions
  [UserRole.SELLER]: [UserRole.STUDENT], // Seller inherits Student permissions
  [UserRole.STUDENT]: [], // Base role
} as const;

export const getInheritedRoles = (role: UserRole): UserRole[] => {
  const inherited = new Set<UserRole>();
  const stack = [role];

  while (stack.length > 0) {
    const currentRole = stack.pop()!;
    inherited.add(currentRole);

    const parentRoles = ROLE_HIERARCHY[currentRole] || [];
    for (const parentRole of parentRoles) {
      if (!inherited.has(parentRole)) {
        stack.push(parentRole);
      }
    }
  }

  return Array.from(inherited);
};

export const getAllPermissionsForRole = (role: UserRole): string[] => {
  const inheritedRoles = getInheritedRoles(role);
  const permissions = new Set<string>();

  for (const inheritedRole of inheritedRoles) {
    const rolePermissions = ROLE_PERMISSIONS[inheritedRole] || [];
    rolePermissions.forEach((permission) => permissions.add(permission));
  }

  return Array.from(permissions);
};

export const PERMISSIONS = {
  STUDENT: {
    VIEW_COURSES: "student:view_courses",
    ENROLL_COURSE: "student:enroll_course",
    VIEW_CONTENT: "student:view_content",
    SUBMIT_ASSIGNMENT: "student:submit_assignment",
    VIEW_PROGRESS: "student:view_progress",
    WRITE_REVIEW: "student:write_review",
    ACCESS_RESOURCES: "student:access_resources",
    PARTICIPATE_DISCUSSION: "student:participate_discussion",
    VIEW_CERTIFICATES: "student:view_certificates",
    DOWNLOAD_MATERIALS: "student:download_materials",
    UPDATE_PROFILE: "student:update_profile",
    VIEW_GRADES: "student:view_grades",
    SUBMIT_SUPPORT_TICKET: "student:submit_support_ticket",
  },
  MENTOR: {
    CREATE_COURSE: "mentor:create_course",
    UPDATE_COURSE: "mentor:update_course",
    DELETE_COURSE: "mentor:delete_course",
    MANAGE_ASSIGNMENTS: "mentor:manage_assignments",
    GRADE_SUBMISSIONS: "mentor:grade_submissions",
    INTERACT_STUDENTS: "mentor:interact_students",
    VIEW_COURSE_ANALYTICS: "mentor:view_course_analytics",
    MANAGE_COURSE_CONTENT: "mentor:manage_course_content",
    CREATE_ANNOUNCEMENT: "mentor:create_announcement",
    MANAGE_RESOURCES: "mentor:manage_resources",
    VIEW_STUDENT_PROGRESS: "mentor:view_student_progress",
    EXPORT_COURSE_DATA: "mentor:export_course_data",
    MANAGE_COURSE_SETTINGS: "mentor:manage_course_settings",
  },
  WRITER: {
    CREATE_BLOG: "writer:create_blog",
    UPDATE_BLOG: "writer:update_blog",
    DELETE_BLOG: "writer:delete_blog",
    MANAGE_CATEGORIES: "writer:manage_categories",
    PUBLISH_CONTENT: "writer:publish_content",
    MANAGE_COMMENTS: "writer:manage_comments",
    CREATE_SERIES: "writer:create_series",
    MANAGE_TAGS: "writer:manage_tags",
    VIEW_CONTENT_ANALYTICS: "writer:view_content_analytics",
    MODERATE_COMMENTS: "writer:moderate_comments",
    FEATURE_CONTENT: "writer:feature_content",
  },
  SELLER: {
    CREATE_PRODUCT: "seller:create_product",
    UPDATE_PRODUCT: "seller:update_product",
    DELETE_PRODUCT: "seller:delete_product",
    MANAGE_INVENTORY: "seller:manage_inventory",
    VIEW_SALES: "seller:view_sales",
    PROCESS_ORDERS: "seller:process_orders",
    MANAGE_PRICING: "seller:manage_pricing",
    VIEW_ANALYTICS: "seller:view_analytics",
    MANAGE_DISCOUNTS: "seller:manage_discounts",
    MANAGE_SHIPPING: "seller:manage_shipping",
    MANAGE_RETURNS: "seller:manage_returns",
    EXPORT_SALES_DATA: "seller:export_sales_data",
  },
  ADMIN: {
    MANAGE_USERS: "admin:manage_users",
    MANAGE_ROLES: "admin:manage_roles",
    VIEW_ANALYTICS: "admin:view_analytics",
    MANAGE_SETTINGS: "admin:manage_settings",
    MANAGE_CONTENT: "admin:manage_content",
    MANAGE_PAYMENTS: "admin:manage_payments",
    MANAGE_REPORTS: "admin:manage_reports",
    MANAGE_SYSTEM: "admin:manage_system",
    VIEW_LOGS: "admin:view_logs",
    MANAGE_INTEGRATIONS: "admin:manage_integrations",
    MANAGE_EMAIL_TEMPLATES: "admin:manage_email_templates",
    MANAGE_API_KEYS: "admin:manage_api_keys",
    MANAGE_BACKUPS: "admin:manage_backups",
  },
};

export const ROLE_PERMISSIONS = {
  [UserRole.STUDENT]: [...Object.values(PERMISSIONS.STUDENT)],
  [UserRole.MENTOR]: [
    ...Object.values(PERMISSIONS.STUDENT),
    ...Object.values(PERMISSIONS.MENTOR),
  ],
  [UserRole.WRITER]: [
    ...Object.values(PERMISSIONS.STUDENT),
    ...Object.values(PERMISSIONS.WRITER),
  ],
  [UserRole.SELLER]: [
    ...Object.values(PERMISSIONS.STUDENT),
    ...Object.values(PERMISSIONS.SELLER),
  ],
  [UserRole.ADMIN]: [
    ...Object.values(PERMISSIONS.STUDENT),
    ...Object.values(PERMISSIONS.MENTOR),
    ...Object.values(PERMISSIONS.WRITER),
    ...Object.values(PERMISSIONS.SELLER),
    ...Object.values(PERMISSIONS.ADMIN),
  ],
};

export const ROLE_TRANSITIONS: Record<UserRole, UserRole[]> = {
  [UserRole.STUDENT]: [UserRole.MENTOR, UserRole.WRITER, UserRole.SELLER], // Student can transition to one specialized role
  [UserRole.MENTOR]: [], // No further transitions allowed
  [UserRole.WRITER]: [], // No further transitions allowed
  [UserRole.SELLER]: [], // No further transitions allowed
  [UserRole.ADMIN]: [], // Admin role is assigned directly, not through transitions
};

export function isValidRoleTransition(
  currentRoles: UserRole[],
  targetRole: UserRole
): boolean {
  // Only allow transitions from STUDENT role to a specialized role
  return (
    currentRoles.length === 1 && // Must have exactly one role
    currentRoles[0] === UserRole.STUDENT && // Must be a STUDENT
    ROLE_TRANSITIONS[UserRole.STUDENT].includes(targetRole) // Can only transition to allowed specialized roles
  );
}

/**
 * Defines which roles are mutually exclusive and cannot be assigned together
 */
export const MUTUALLY_EXCLUSIVE_ROLES: UserRole[][] = [
  // Specialized roles are mutually exclusive - a user can only have one of these
  [UserRole.MENTOR, UserRole.WRITER, UserRole.SELLER]
];

/**
 * Validates that a user's roles don't violate mutual exclusivity rules
 * @param roles Array of roles to validate
 * @returns true if roles are valid, false if they violate constraints
 */
export function validateRoleConstraints(roles: UserRole[]): boolean {
  // Skip validation for admin role
  if (roles.includes(UserRole.ADMIN)) {
    return true;
  }

  // Check each mutually exclusive role group
  for (const exclusiveGroup of MUTUALLY_EXCLUSIVE_ROLES) {
    const matchingRoles = roles.filter(role => exclusiveGroup.includes(role));
    if (matchingRoles.length > 1) {
      return false; // Found multiple roles from an exclusive group
    }
  }

  return true;
}

/**
 * Gets a descriptive error message for invalid role combinations
 * @param roles Array of roles to validate
 * @returns Error message if invalid, empty string if valid
 */
export function getRoleConstraintViolationMessage(roles: UserRole[]): string {
  // Skip validation for admin role
  if (roles.includes(UserRole.ADMIN)) {
    return '';
  }

  // Check each mutually exclusive role group
  for (const exclusiveGroup of MUTUALLY_EXCLUSIVE_ROLES) {
    const matchingRoles = roles.filter(role => exclusiveGroup.includes(role));
    if (matchingRoles.length > 1) {
      return `The following roles cannot be assigned together: ${matchingRoles.join(', ')}`;
    }
  }

  return '';
}
