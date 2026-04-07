import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authOptions } from './backend/config/auth.config';
import { getUserByEmail } from './backend/repositories/user.repository';
import { verifyPassword } from './backend/utils/password.utils';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authOptions,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await getUserByEmail(credentials.email as string);
        if (!user) return null;

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password_hash
        );
        if (!isValid) return null;

        return {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
});