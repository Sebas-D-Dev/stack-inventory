import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Configure which paths require authentication
const protectedPaths = [
  '/posts/new',
  '/dashboard',
  '/users/new',
  '/vendors',
  '/products',
  '/products/new',
  '/products/[id]',
  '/categories',
  '/categories/new',
  '/profile',
  '/purchase-order',
  '/',
  // Add other protected routes here
];

// Paths that should be accessible to public (no auth)
const publicPaths = [
  '/login', 
  '/register', 
  '/api', 
  '/setup', 
  '/forgot-password', 
  '/api/auth/forgot-password',
  '/reset-password', 
  '/api/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Get the user token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  });
  
  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
    
    // Check if user is admin or moderator
    const isAdminOrModerator = token.isAdmin || token.role === 'MODERATOR';
    
    if (!isAdminOrModerator) {
      // Redirect non-admin/non-moderator users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Check if the path needs protection
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path)) || 
    // Also protect root paths like /posts/1
    (pathname !== '/' && pathname !== '/posts' && !pathname.startsWith('/posts/') && !pathname.includes('.'));
  
  if (isProtectedPath) {
    // If no token, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure matcher for optimization - only run middleware on specific paths
export const config = {
  matcher: [
    // Match all paths except for these
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};