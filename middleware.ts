import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/', '/:id', '/api/:path*', '/login', '/register', '/plans', '/landing', '/privacy-policy', '/terms-of-service'],
};
