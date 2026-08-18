import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run proxy for routes starting with /admin
  if (pathname.startsWith('/admin')) {
    const parts = pathname.split('/');
    // parts will be ['', 'admin', '[session]', 'login', ...]
    const session = parts[2];

    // If there is no session segment (e.g., just /admin), skip or redirect
    if (!session) {
      return NextResponse.next();
    }

    // Skip check if we are already on the login page
    if (parts[3] === 'login') {
      return NextResponse.next();
    }

    // Read the auth cookie
    const adminToken = request.cookies.get('admin_token')?.value;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    // Check if password exists and matches the token
    if (!adminToken || !expectedPassword || adminToken !== expectedPassword) {
      // Redirect to the login page for this specific session
      const loginUrl = new URL(`/admin/${session}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
