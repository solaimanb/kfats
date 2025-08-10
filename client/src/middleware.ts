import { NextRequest, NextResponse } from 'next/server'

// Avoid trusting client-side decoded JWT for authorization decisions.
// Keep minimal routing logic here; server-side APIs enforce RBAC.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('kfats_token')?.value
  // Do not decode/verify token on the edge; treat token presence as authenticated hint only.
  const userRole = request.cookies.get('kfats_role')?.value

  const protectedPaths = [
    '/dashboard',
    '/courses/create',
    '/articles/create',
    '/products/create',
    '/profile',
    '/role-application'
  ]

  const adminOnlyPaths = [
    '/admin',
    '/dashboard/admin/role-applications',
    '/dashboard/admin/users',
    '/dashboard/admin/content-management',
    '/dashboard/admin/settings'
  ]

  const authPaths = ['/login', '/signup']

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminOnlyPath = adminOnlyPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  const isRootPath = pathname === '/'

  const isAdmin = userRole === 'admin'

  if ((isProtectedPath || isAdminOnlyPath) && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Don't enforce admin-only redirects here; server enforces RBAC

  if (isAuthPath && token) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/dashboard' && token) {
    const roleRoutes: Record<string, string> = {
      'admin': '/dashboard/admin',
      'mentor': '/dashboard/mentor',
      'student': '/dashboard/student',
      'writer': '/dashboard/writer',
      'seller': '/dashboard/seller'
    }
    const normalizedRole = (userRole || '').toLowerCase()
    const targetRoute = roleRoutes[normalizedRole]
    if (targetRoute) {
      return NextResponse.redirect(new URL(targetRoute, request.url))
    }
  }

  if (isRootPath) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
