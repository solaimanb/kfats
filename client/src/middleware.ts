import { NextRequest, NextResponse } from "next/server";
import { ResourceType, PermissionAction, UserRole } from "./config/rbac/types";
import { ROUTES, DEFAULT_REDIRECTS } from "./config/routes";

// Define protected routes and their required permissions
const PROTECTED_ROUTES = {
  '/profile': {
    resource: ResourceType.USER,
    action: PermissionAction.READ
  },
  '/dashboard/courses': {
    resource: ResourceType.COURSE,
    action: PermissionAction.READ
  },
  '/dashboard/courses/create': {
    resource: ResourceType.COURSE,
    action: PermissionAction.CREATE
  },
  '/dashboard/articles': {
    resource: ResourceType.ARTICLE,
    action: PermissionAction.READ
  },
  '/dashboard/products': {
    resource: ResourceType.PRODUCT,
    action: PermissionAction.READ
  }
} as const;

// Define role-specific routes
const ROLE_ROUTES = {
  [UserRole.ADMIN]: ['/admin', '/dashboard/admin'],
  [UserRole.MENTOR]: ['/dashboard/courses'],
  [UserRole.STUDENT]: ['/dashboard/my-courses'],
  [UserRole.WRITER]: ['/dashboard/articles'],
  [UserRole.SELLER]: ['/dashboard/products']
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("user-role")?.value;

  // Helper function to check if path matches any routes
  const matchesPath = (paths: readonly string[] | string[]) =>
    paths.some(path => pathname.startsWith(path));

  // Set up response with no-cache headers
  const redirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.headers.set("Cache-Control", "no-store");
    return response;
  };

  // Check if it's a protected route
  const protectedRoute = PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES];

  // Handle authentication
  if (matchesPath(ROUTES.protected) || matchesPath(ROUTES.admin)) {
    if (!token) {
      const response = redirect("/login");
      response.cookies.set("returnTo", pathname, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
      return response;
    }

    // Handle admin authorization
    if (matchesPath(ROUTES.admin) && userRole !== "admin") {
      return redirect(DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || DEFAULT_REDIRECTS.user);
    }
  }

  // Redirect authenticated users away from auth pages
  if (matchesPath(ROUTES.auth) && token) {
    const returnTo = request.cookies.get("returnTo")?.value;
    // If there's no specific return URL, redirect based on role
    const defaultRedirect = DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || DEFAULT_REDIRECTS.user;
    const response = redirect(returnTo || defaultRedirect);
    response.cookies.delete("returnTo");
    return response;
  }

  // Add no-cache headers for protected routes
  const response = NextResponse.next();
  if (matchesPath([...ROUTES.protected, ...ROUTES.admin])) {
    response.headers.set("Cache-Control", "no-store");
  }

  // If has token, verify and check permissions
  if (token && protectedRoute) {
    try {
      const user = await verifyToken(token);

      // For profile route, only check if user is authenticated
      if (pathname === '/profile') {
        if (!user) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
        return response;
      }

      // For other protected routes, check specific permissions
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check if user has required permission
      const hasPermission = checkUserPermission(
        user,
        protectedRoute.resource,
        protectedRoute.action
      );

      if (!hasPermission) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Check role-specific routes
      const isRoleRoute = (Object.entries(ROLE_ROUTES) as [string, readonly string[]][]).some(
        ([role, routes]) =>
          routes.includes(pathname) && user.roles.includes(role as UserRole)
      );

      if (!isRoleRoute && pathname !== '/profile') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next|images|public|favicon.ico).*)"],
};

// Implement token verification
async function verifyToken(token: string): Promise<{
  id: string;
  roles: UserRole[];
  permissions: string[];
} | null> {
  try {
    // Make a request to the backend to verify the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify`, {
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      roles: data.roles,
      permissions: data.permissions || []
    };
  } catch {
    return null;
  }
}

// Implement permission checking
function checkUserPermission(
  user: {
    id: string;
    roles: UserRole[];
    permissions?: string[];
  },
  resource: ResourceType,
  action: PermissionAction
): boolean {
  // Basic permission check
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }

  // Admin has all permissions
  if (user.roles.includes(UserRole.ADMIN)) {
    return true;
  }

  // Check user permissions if they exist
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.some(
      (permission: string) => permission === `${resource}:${action}`
    );
  }

  // Default role-based permissions
  const rolePermissions: Record<UserRole, ResourceType[]> = {
    [UserRole.ADMIN]: [ResourceType.USER, ResourceType.COURSE, ResourceType.ARTICLE, ResourceType.PRODUCT],
    [UserRole.MENTOR]: [ResourceType.COURSE],
    [UserRole.STUDENT]: [ResourceType.COURSE],
    [UserRole.WRITER]: [ResourceType.ARTICLE],
    [UserRole.SELLER]: [ResourceType.PRODUCT],
    [UserRole.USER]: [ResourceType.USER]
  };

  // Check if any of the user's roles have permission for the resource
  return user.roles.some((role: UserRole) =>
    rolePermissions[role]?.includes(resource)
  );
}
