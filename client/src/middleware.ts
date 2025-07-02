import { NextRequest, NextResponse } from "next/server";
import { ResourceType, PermissionAction, UserRole } from "./config/rbac/types";
import { ROUTES, DEFAULT_REDIRECTS } from "./config/routes";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  ...ROUTES.auth,
  '/role-application/become-mentor',
  '/role-application/become-seller',
  '/role-application/become-writer',
  '/role-application/success'
];

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
  [UserRole.MENTOR]: ['/dashboard/courses', '/dashboard/mentoring'],
  [UserRole.STUDENT]: ['/dashboard/my-courses', '/dashboard/courses'],
  [UserRole.WRITER]: ['/dashboard/articles'],
  [UserRole.SELLER]: ['/dashboard/products'],
  [UserRole.USER]: ['/dashboard', '/dashboard/user', '/dashboard/user/role-applications']
} as const;

// Define protected routes that don't require specific roles
const COMMON_PROTECTED_ROUTES = [
  '/profile',
  '/dashboard',
  '/dashboard/user/role-applications'
];

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

  // Check if it's a public route
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow access to role applications page for any authenticated user
  if (pathname === '/dashboard/user/role-applications' && token) {
    return NextResponse.next();
  }

  // Check if it's a dashboard route after role application
  if (pathname.startsWith('/dashboard/user') && request.headers.get('referer')?.includes('/role-application/')) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  if (matchesPath(ROUTES.protected) || matchesPath(ROUTES.admin)) {
    if (!token) {
      console.log('[Middleware] No token found, redirecting to login');
      const response = redirect("/login");
      response.cookies.set("returnTo", pathname, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
      return response;
    }

    try {
      const user = await verifyToken(token);

      if (!user) {
        console.log('[Middleware] Token verification failed, redirecting to login');
        return redirect("/login");
      }

      // For common protected routes like profile and dashboard root, only check if user is authenticated
      if (COMMON_PROTECTED_ROUTES.includes(pathname)) {
        return NextResponse.next();
      }

      // For other protected routes, check specific permissions
      const protectedRoute = PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES];
      if (protectedRoute) {
        const hasPermission = checkUserPermission(
          user,
          protectedRoute.resource,
          protectedRoute.action
        );

        if (!hasPermission) {
          console.log('[Middleware] Permission denied, redirecting to unauthorized');
          return redirect("/unauthorized");
        }
      }

      // Check role-specific routes
      if (pathname !== '/profile') {
        const isRoleRoute = (Object.entries(ROLE_ROUTES) as [string, readonly string[]][]).some(
          ([role, routes]) =>
            routes.includes(pathname) && user.roles.includes(role as UserRole)
        );

        if (!isRoleRoute) {
          console.log('[Middleware] Role route access denied, redirecting to unauthorized');
          return redirect("/unauthorized");
        }
      }

      return NextResponse.next();
    } catch (error) {
      console.error('[Middleware] Token verification error:', error);
      return redirect("/login");
    }
  }

  // Redirect authenticated users away from auth pages
  if (matchesPath(ROUTES.auth) && token) {
    try {
      const user = await verifyToken(token);
      if (user) {
        const returnTo = request.cookies.get("returnTo")?.value;
        const defaultRedirect = DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || DEFAULT_REDIRECTS.user;
        const response = redirect(returnTo || defaultRedirect);
        response.cookies.delete("returnTo");
        return response;
      }
    } catch (error) {
      console.error('[Middleware] Auth page redirect error:', error);
    }
  }

  return NextResponse.next();
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Token validation failed:', await response.text());
      return null;
    }

    const { status, data } = await response.json();

    if (status !== 'success' || !data?.user) {
      console.error('No user data in validation response');
      return null;
    }

    const user = data.user;
    return {
      id: user._id,
      roles: user.roles,
      permissions: user.permissions || []
    };
  } catch (error) {
    console.error('Token validation error:', error);
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
