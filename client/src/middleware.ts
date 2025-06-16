import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, DEFAULT_REDIRECTS } from "@/config/routes";
import { ResourceType, PermissionAction, UserRole } from '@/types/rbac';

// Define protected routes and their required permissions
const PROTECTED_ROUTES = {
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
  const matchesPath = (paths: readonly string[]) => 
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
      // Here you would typically verify the token and get user data
      // For now, we'll assume the token contains the necessary info
      const user = await verifyToken(token);

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
      const isRoleRoute = Object.entries(ROLE_ROUTES).some(
        ([role, routes]) =>
          routes.includes(pathname) && user.roles.includes(role as UserRole)
      );

      if (!isRoleRoute) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // Token verification failed
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next|images|public|favicon.ico).*)"],
};

// These functions would be implemented elsewhere
async function verifyToken(token: string): Promise<any> {
  // Implement token verification
  return null;
}

function checkUserPermission(
  user: any,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  // Implement permission checking
  return false;
}
