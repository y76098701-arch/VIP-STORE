import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isApiAdmin = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');

  if (isApiAdmin || isAdminPage) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuthorized = !!token && (token as any).role === 'admin';

    if (!isAuthorized) {
      if (isApiAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin session required.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/((?!login).*)', '/api/admin/:path*'] };
