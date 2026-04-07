import type { NextAuthConfig } from 'next-auth';

// Edge-safe auth config — no Node.js-only imports allowed here
// This is used by middleware (Edge runtime) and extended in auth.ts with providers
export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.AUTH_SESSION_MAX_AGE ?? 86400),
  },

  providers: [], // Providers added in auth.ts (Node.js runtime only)

  callbacks: {
    // Add custom fields to JWT token
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },

    // Add custom fields to session object
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
};