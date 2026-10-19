import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

const PROTECTED = ['/app', '/onboarding', '/invite'];

export async function proxy(request: NextRequest) {
  const authRes = await auth0.middleware(request);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith('/auth/') && pathname !== '/auth/error') return authRes;

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const session = await auth0.getSession(request);
    if (!session) {
      const login = new URL('/login', request.url);
      login.searchParams.set('returnTo', pathname + search);
      return NextResponse.redirect(login);
    }
  }
  return authRes;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|webp|avif)$).*)'],
};
