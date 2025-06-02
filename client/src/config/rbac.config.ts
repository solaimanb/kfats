import { UserRole } from "@/types";
import {
  PermissionAction,
  ResourceType,
  RolePermissions,
} from "@/types";

// Role-based Permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: {
    routes: ["/admin/*", "/dashboard/*"],
    resources: {
      [ResourceType.USER]: [PermissionAction.MANAGE],
      [ResourceType.COURSE]: [PermissionAction.MANAGE],
      [ResourceType.CATEGORY]: [PermissionAction.MANAGE],
      [ResourceType.ROLE]: [PermissionAction.MANAGE],
      [ResourceType.PRODUCT]: [PermissionAction.MANAGE],
      [ResourceType.ARTICLE]: [PermissionAction.MANAGE],
    },
  },
  [UserRole.MENTOR]: {
    routes: ["/dashboard/courses/*", "/dashboard/students/*"],
    resources: {
      [ResourceType.COURSE]: [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
      ],
      [ResourceType.USER]: [PermissionAction.READ],
    },
  },
  [UserRole.STUDENT]: {
    routes: ["/dashboard/my-courses/*", "/dashboard/progress/*"],
    resources: {
      [ResourceType.COURSE]: [PermissionAction.READ],
      [ResourceType.USER]: [PermissionAction.READ],
    },
  },
  [UserRole.WRITER]: {
    routes: ["/dashboard/articles/*"],
    resources: {
      [ResourceType.ARTICLE]: [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
      ],
    },
  },
  [UserRole.SELLER]: {
    routes: ["/dashboard/products/*"],
    resources: {
      [ResourceType.PRODUCT]: [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
      ],
    },
  },
  [UserRole.USER]: {
    routes: ["/"],
    resources: {
      [ResourceType.COURSE]: [PermissionAction.READ],
      [ResourceType.PRODUCT]: [PermissionAction.READ],
      [ResourceType.ARTICLE]: [PermissionAction.READ],
    },
  },
} as const;

// Route Configurations
export const ROUTE_CONFIG = {
  public: ["/", "/about", "/courses", "/contact"],
  auth: ["/login", "/register", "/forgot-password", "/reset-password"],
  protected: ["/dashboard", "/profile", "/settings"],
  roleSpecific: {
    [UserRole.ADMIN]: ["/admin/*", "/dashboard/admin/*"],
    [UserRole.MENTOR]: [
      "/dashboard/courses/create",
      "/dashboard/courses/edit/*",
    ],
    [UserRole.STUDENT]: ["/dashboard/my-courses/*", "/dashboard/progress/*"],
    [UserRole.WRITER]: ["/dashboard/articles/*"],
    [UserRole.SELLER]: ["/dashboard/products/*"],
    [UserRole.USER]: ["/"],
  },
} as const;

// Default Redirects
export const DEFAULT_REDIRECTS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "/admin/dashboard",
  [UserRole.MENTOR]: "/dashboard/courses",
  [UserRole.STUDENT]: "/dashboard/my-courses",
  [UserRole.WRITER]: "/dashboard/articles",
  [UserRole.SELLER]: "/dashboard/products",
  [UserRole.USER]: "/",
} as const;

// Permission Helpers
export function hasPermission(
  userRoles: UserRole[],
  resource: ResourceType,
  action: PermissionAction
): boolean {
  return userRoles.some((role) => {
    const rolePerms = ROLE_PERMISSIONS[role]?.resources[resource];
    return (
      rolePerms?.includes(action) ||
      rolePerms?.includes(PermissionAction.MANAGE)
    );
  });
}

export function hasRouteAccess(userRoles: UserRole[], route: string): boolean {
  return userRoles.some((role) => {
    const roleRoutes = ROLE_PERMISSIONS[role]?.routes || [];
    return roleRoutes.some((pattern) => {
      const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
      return regex.test(route);
    });
  });
}
