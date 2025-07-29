import { NextRequest, NextResponse } from 'next/server'

function decodeJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('kfats_token')?.value

  const tokenData = token ? decodeJWT(token) : null
  const userRole = tokenData?.role

  const protectedPaths = [
    '/dashboard',
    '/courses/create',
    '/articles/create',
    '/products/create',
    '/profile',
    '/role-application'
  ]

  const adminOnlyPaths = ['/admin']

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

  if (isAdminOnlyPath && token && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAuthPath && token) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
