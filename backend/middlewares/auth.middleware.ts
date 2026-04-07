import { auth } from '../../auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '../../frontend/types';

// Higher-order function — wraps API route handlers with auth check
export const withAuth = (
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) => {
  return auth(async (req, context) => {
    const session = req.auth;

    // Not logged in
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role check
    if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return handler(req, context);
  }) as unknown as (req: NextRequest, context: unknown) => Promise<NextResponse>;
};