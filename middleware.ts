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
  '/',
  // Add other protected routes here
];

// Paths that should be accessible to public (no auth)
const publicPaths = ['/login', '/register', '/api', '/setup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if the path needs protection
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path)) || 
    // Also protect root paths like /posts/1
    (pathname !== '/' && pathname !== '/posts' && !pathname.startsWith('/posts/') && !pathname.includes('.'));
  
  if (isProtectedPath) {
    // Get the user token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
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