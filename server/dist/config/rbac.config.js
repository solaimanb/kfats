"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUTUALLY_EXCLUSIVE_ROLES = exports.ROLE_TRANSITIONS = exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.getAllPermissionsForRole = exports.getInheritedRoles = exports.ROLE_HIERARCHY = exports.ApplicationStatus = exports.UserStatus = exports.UserRole = void 0;
exports.isValidRoleTransition = isValidRoleTransition;
exports.validateRoleConstraints = validateRoleConstraints;
exports.getRoleConstraintViolationMessage = getRoleConstraintViolationMessage;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MENTOR"] = "mentor";
    UserRole["STUDENT"] = "student";
    UserRole["WRITER"] = "writer";
    UserRole["SELLER"] = "seller";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
    UserStatus["BANNED"] = "banned";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "pending";
    ApplicationStatus["IN_REVIEW"] = "in_review";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["CANCELLED"] = "cancelled";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
exports.ROLE_HIERARCHY = {
    [UserRole.ADMIN]: [],
    [UserRole.MENTOR]: [UserRole.STUDENT],
    [UserRole.WRITER]: [UserRole.STUDENT],
    [UserRole.SELLER]: [UserRole.STUDENT],
    [UserRole.STUDENT]: [],
};
const getInheritedRoles = (role) => {
    const inherited = new Set();
    const stack = [role];
    while (stack.length > 0) {
        const currentRole = stack.pop();
        inherited.add(currentRole);
        const parentRoles = exports.ROLE_HIERARCHY[currentRole] || [];
        for (const parentRole of parentRoles) {
            if (!inherited.has(parentRole)) {
                stack.push(parentRole);
            }
        }
    }
    return Array.from(inherited);
};
exports.getInheritedRoles = getInheritedRoles;
const getAllPermissionsForRole = (role) => {
    const inheritedRoles = (0, exports.getInheritedRoles)(role);
    const permissions = new Set();
    for (const inheritedRole of inheritedRoles) {
        const rolePermissions = exports.ROLE_PERMISSIONS[inheritedRole] || [];
        rolePermissions.forEach((permission) => permissions.add(permission));
    }
    return Array.from(permissions);
};
exports.getAllPermissionsForRole = getAllPermissionsForRole;
exports.PERMISSIONS = {
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
exports.ROLE_PERMISSIONS = {
    [UserRole.STUDENT]: [...Object.values(exports.PERMISSIONS.STUDENT)],
    [UserRole.MENTOR]: [
        ...Object.values(exports.PERMISSIONS.STUDENT),
        ...Object.values(exports.PERMISSIONS.MENTOR),
    ],
    [UserRole.WRITER]: [
        ...Object.values(exports.PERMISSIONS.STUDENT),
        ...Object.values(exports.PERMISSIONS.WRITER),
    ],
    [UserRole.SELLER]: [
        ...Object.values(exports.PERMISSIONS.STUDENT),
        ...Object.values(exports.PERMISSIONS.SELLER),
    ],
    [UserRole.ADMIN]: [
        ...Object.values(exports.PERMISSIONS.STUDENT),
        ...Object.values(exports.PERMISSIONS.MENTOR),
        ...Object.values(exports.PERMISSIONS.WRITER),
        ...Object.values(exports.PERMISSIONS.SELLER),
        ...Object.values(exports.PERMISSIONS.ADMIN),
    ],
};
exports.ROLE_TRANSITIONS = {
    [UserRole.STUDENT]: [UserRole.MENTOR, UserRole.WRITER, UserRole.SELLER],
    [UserRole.MENTOR]: [],
    [UserRole.WRITER]: [],
    [UserRole.SELLER]: [],
    [UserRole.ADMIN]: [],
};
function isValidRoleTransition(currentRoles, targetRole) {
    return (currentRoles.length === 1 &&
        currentRoles[0] === UserRole.STUDENT &&
        exports.ROLE_TRANSITIONS[UserRole.STUDENT].includes(targetRole));
}
exports.MUTUALLY_EXCLUSIVE_ROLES = [
    [UserRole.MENTOR, UserRole.WRITER, UserRole.SELLER]
];
function validateRoleConstraints(roles) {
    if (roles.includes(UserRole.ADMIN)) {
        return true;
    }
    for (const exclusiveGroup of exports.MUTUALLY_EXCLUSIVE_ROLES) {
        const matchingRoles = roles.filter(role => exclusiveGroup.includes(role));
        if (matchingRoles.length > 1) {
            return false;
        }
    }
    return true;
}
function getRoleConstraintViolationMessage(roles) {
    if (roles.includes(UserRole.ADMIN)) {
        return '';
    }
    for (const exclusiveGroup of exports.MUTUALLY_EXCLUSIVE_ROLES) {
        const matchingRoles = roles.filter(role => exclusiveGroup.includes(role));
        if (matchingRoles.length > 1) {
            return `The following roles cannot be assigned together: ${matchingRoles.join(', ')}`;
        }
    }
    return '';
}
//# sourceMappingURL=rbac.config.js.map