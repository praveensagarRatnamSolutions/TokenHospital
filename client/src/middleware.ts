import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // 1. If hitting login or register and already logged in, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    if (userRole === 'SUPERADMIN') return NextResponse.redirect(new URL('/superadmin', request.url));
    if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
    if (userRole === 'DOCTOR') return NextResponse.redirect(new URL('/doctor', request.url));
    return NextResponse.redirect(new URL('/kiosk', request.url));
  }

  // 2. Protect Portals
  const isSuperAdminPath = pathname.startsWith('/superadmin');
  const isAdminPath = pathname.startsWith('/admin');
  const isDoctorPath = pathname.startsWith('/doctor');

  // If no token, redirect to login
  if (!token && (isSuperAdminPath || isAdminPath || isDoctorPath)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based protection
  if (token) {
    if (isSuperAdminPath && userRole !== 'SUPERADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (isAdminPath && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (isDoctorPath && userRole !== 'DOCTOR') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
    '/doctor/:path*',
    '/login',
    '/register',
  ],
};
