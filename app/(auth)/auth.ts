import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { createUser, getUser } from '@/lib/db/queries';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize({ email, password }: any) {
        if (!email || !password) return null;
        
        const users = await getUser(email);
        if (users.length === 0) return null;
        
        // If user has no password (OAuth user trying to use password login)
        if (!users[0].password) return null;
        
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        
        return {
          id: users[0].id,
          email: users[0].email,
          name: users[0].name,
          image: users[0].image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign-in
      if (account?.provider === 'google' && user.email) {
        const users = await getUser(user.email);
        
        // If user doesn't exist, create a new one
        if (users.length === 0) {
          try {
            await createUser(
              user.email,
              null, // No password for Google users
              user.name || undefined,
              user.image || undefined,
              'google'
            );
          } catch (error) {
            console.error('Error creating user during Google sign in:', error);
            return false;
          }
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          provider: account.provider,
        };
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        // You can also add provider info to the session if needed
        // session.user.provider = token.provider;
      }
      return session;
    },
  },
});