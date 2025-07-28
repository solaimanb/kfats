import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies
  const token = request.cookies.get('kfats_token')?.value
  
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/courses/create', '/articles/create', '/products/create', '/profile']
  
  // Admin only routes
  const adminPaths = ['/admin']
  
  // Auth routes (redirect if already logged in)
  const authPaths = ['/login', '/signup']
  
  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  
  // Redirect to login if accessing protected route without token
  if ((isProtectedPath || isAdminPath) && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
