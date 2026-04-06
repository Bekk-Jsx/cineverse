import config from 'config';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUserByEmail } from '../repositories/user.repository';
import { verifyPassword } from '../utils/password.utils';


const authConfig = config.get<{
  secret: string;
  sessionMaxAge: number;
}>('auth');

export const authOptions: NextAuthConfig = {
  secret: authConfig.secret,

  // We use JWT strategy — stored in Redis
  session: {
    strategy: 'jwt',
    maxAge: authConfig.sessionMaxAge,
  },

  providers: [
    Credentials({
      name: 'credentials',
      // defines what fields the login form needs
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      // Called when user submits login form
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await getUserByEmail(credentials.email as string);
        if (!user) return null;

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password_hash
        );
        if (!isValid) return null;

        // Return user object → goes into JWT token
        return {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],

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
    signIn: '/login',    // redirect to our custom login page
    error: '/login',     // redirect errors to login page
  },
};