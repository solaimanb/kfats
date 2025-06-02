import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, DEFAULT_REDIRECTS } from "@/config/routes";

export function middleware(request: NextRequest) {
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
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next|images|public|favicon.ico).*)"],
};
