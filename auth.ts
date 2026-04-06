import NextAuth from 'next-auth';
import { authOptions } from './backend/config/auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);