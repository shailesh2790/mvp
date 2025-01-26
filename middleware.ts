import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const authPath = req.nextUrl.pathname.startsWith('/auth');

    if (!session && !authPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (session && req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/assessment', req.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return res;
}

export const config = {
  matcher: ['/assessment/:path*', '/login', '/']
};