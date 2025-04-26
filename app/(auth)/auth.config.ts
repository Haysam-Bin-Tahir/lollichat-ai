import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname === '/'; // Only the root path
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAuth = nextUrl.pathname.startsWith('/api/auth');
      const isApiRoute = nextUrl.pathname.startsWith('/api/');
      const isPublicPage = ['/landing', '/privacy-policy', '/terms-of-service'].some(
        path => nextUrl.pathname === path
      );
      
      // Add additional app routes that should be accessible
      const isAppRoute = ['/plans', '/topics'].some(
        path => nextUrl.pathname === path || nextUrl.pathname.startsWith(path + '/')
      );

      // Always allow access to auth-related routes and public pages
      if (isOnAuth || isPublicPage) return true;
      
      // For API routes, return a proper JSON response instead of redirecting
      if (isApiRoute) {
        if (isLoggedIn) return true;
        // For subscription-related API calls from public pages, allow them through
        // but they'll be handled by the API route itself
        return true;
      }

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      // Allow access to app routes if logged in
      if (isAppRoute) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/login', nextUrl as unknown as URL));
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        // Redirect unauthenticated users to landing page
        return Response.redirect(new URL('/landing', nextUrl as unknown as URL));
      }

      // For any other routes, allow if logged in
      if (isLoggedIn) return true;
      
      // For any other routes, redirect to login if not logged in
      return Response.redirect(new URL('/login', nextUrl as unknown as URL));
    },
  },
} satisfies NextAuthConfig;