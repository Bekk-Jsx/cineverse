import type { DefaultSession } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';
import type { UserRole } from './user.types';

// Extend User type
declare module 'next-auth' {
  interface User {
    role: UserRole;
    username: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      username: string;
    } & DefaultSession['user'];
  }
}

// Extend JWT type
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    username: string;
  }
}