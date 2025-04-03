// app/(auth)/auth.ts - Update section

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
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
            
            // Get the newly created user to get the ID
            const newUsers = await getUser(user.email);
            if (newUsers.length > 0) {
              // Update the user object with the database ID
              user.id = newUsers[0].id;
              console.log('Created new Google user with ID:', user.id);
            }
          } catch (error) {
            console.error('Error creating user during Google sign in:', error);
            return false;
          }
        } else {
          // User exists, assign the ID from the database
          user.id = users[0].id;
          console.log('Found existing Google user with ID:', user.id);
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        if (account) {
          token.provider = account.provider;
        }
        
        console.log('JWT callback - user ID set:', token.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        console.log('Session callback - user ID set:', session.user.id);
      }
      return session;
    },
  },
});