import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('kfats_token')?.value

  const protectedPaths = [
    '/dashboard',
    '/courses/create',
    '/articles/create',
    '/products/create',
    '/profile',
    '/role-application'
  ]

  const adminPaths = ['/admin']

  const authPaths = ['/login', '/signup']

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  const isRootPath = pathname === '/'

  if ((isProtectedPath || isAdminPath) && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
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
