import { auth } from './auth';
import { NextResponse } from 'next/server';

// Routes configuration
const publicRoutes = ['/', '/login', '/register'];
const authRoutes = ['/login', '/register'];      // redirect to home if already logged in
const adminRoutes = ['/api/admin', '/dashboard/admin'];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;
  const path = nextUrl.pathname;

  // Check route types
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isApiRoute = path.startsWith('/api');

  // Already logged in → redirect away from login/register
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // Admin route → must be admin
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  // Protected API route → must be logged in
  if (isApiRoute && !isPublicRoute && !isLoggedIn) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.next();
});

// Middleware runs on these paths only
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};