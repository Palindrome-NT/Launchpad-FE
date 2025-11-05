import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const accessToken = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  console.log({accessToken, pathname});
  
  const routeConfig: Record<string, { requiresAuth: boolean; allowedRoles: string[] }> = {
    '/posts': { requiresAuth: true, allowedRoles: ['user', 'admin', 'superadmin'] },
    '/chat': { requiresAuth: true, allowedRoles: ['user', 'admin', 'superadmin'] },
    '/dashboard': { requiresAuth: true, allowedRoles: ['admin', 'superadmin'] },
    '/lazy-loading': { requiresAuth: false, allowedRoles: [] }, // Public
  };

  const matchedRoute = Object.entries(routeConfig).find(([route]) => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  const [, config] = matchedRoute;

  if (!config.requiresAuth) {
    return NextResponse.next();
  }

  if (!accessToken) {
    console.log(`🔒 Access denied to ${pathname}: No access token`);
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (config.allowedRoles.length > 0 && userRole) {
    if (!config.allowedRoles.includes(userRole)) {
      console.log(`🚫 Access denied to ${pathname}: Role ${userRole} not allowed`);
      const unauthorizedUrl = new URL('/auth/login', request.url);
      unauthorizedUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  console.log(`✅ Access granted to ${pathname} for role: ${userRole || 'unknown'}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/posts/:path*',
    '/chat/:path*',
    '/dashboard/:path*',
    '/lazy-loading/:path*',
  ],
};

