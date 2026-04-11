import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from '@/backend/middlewares/auth.middleware';
import { getUserById, updateUser } from '@/backend/repositories/user.repository';
import type { Session } from 'next-auth';

// Extends NextRequest with auth session injected by Auth.js
// Your withAuth middleware injects auth onto the request object at runtime:
export interface AuthenticatedRequest extends NextRequest {
  auth: Session;
}

// GET /api/users/profile — get current user profile
export const GET = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const user = await getUserById(session.user.id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Never return password hash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safeUser } = user;

  return NextResponse.json({ data: safeUser });
});

// PUT /api/users/profile — update current user profile
export const PUT = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const body = await req.json();

  // Only allow updating these fields
  const { username, avatar_url } = body;

  const updated = await updateUser(session.user.id, {
    ...(username && { username }),
    ...(avatar_url && { avatar_url }),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safeUser } = updated;

  return NextResponse.json({ data: safeUser });
});