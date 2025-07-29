import { User, UserRole } from "@/lib/types/api"

/**
 * --------------------------------------
 * Determines the appropriate 
 * redirect path after login/registration
 * based on user role and context
 * --------------------------------------
 */
export function getPostAuthRedirectPath(user: User, defaultPath?: string): string {
  if (user.role === UserRole.USER) {
    return "/"
  }
  
  if ([UserRole.STUDENT, UserRole.MENTOR, UserRole.WRITER, UserRole.SELLER, UserRole.ADMIN].includes(user.role)) {
    return "/dashboard"
  }
  
  return defaultPath || "/dashboard"
}

/**
 * ----------------------------------
 * Checks if user should see the
 * authenticated version of home page
 * ----------------------------------
 */
export function shouldShowAuthenticatedHome(user: User | null): boolean {
  return user !== null && user.role === UserRole.USER
}

/**
 * -----------------------------------
 * Checks if user should be redirected
 * to dashboard
 * -----------------------------------
 */
export function shouldRedirectToDashboard(user: User | null): boolean {
  if (!user) return false
  return [UserRole.STUDENT, UserRole.MENTOR, UserRole.WRITER, UserRole.SELLER, UserRole.ADMIN].includes(user.role)
}

/**
 * -------------------------------
 * Gets the appropriate home page
 * path for current user
 * -------------------------------
 */
export function getHomePagePath(user: User | null): string {
  if (!user) return "/"
  if (user.role === UserRole.USER) return "/"
  return "/dashboard"
}
