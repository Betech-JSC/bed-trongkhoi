import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-change-me-in-production-123456789'
);

async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jose.jwtVerify(input, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if target is a static file or public upload
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Define protected paths
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isCreateWedding = pathname === '/wedding/create' || pathname.startsWith('/wedding/create/');
  const isEditWedding = pathname.endsWith('/edit');
  const isRsvpList = pathname.endsWith('/rsvps');

  if (isDashboard || isCreateWedding || isEditWedding || isRsvpList) {
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const decrypted = await decrypt(session);
    if (!decrypted || !decrypted.userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect logged-in users from login/register
  if (pathname === '/login' || pathname === '/register') {
    const session = request.cookies.get('session')?.value;
    if (session) {
      const decrypted = await decrypt(session);
      if (decrypted && decrypted.userId) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
