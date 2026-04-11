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

// GET /api/users/favorites
export const GET = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const user = await getUserById(session.user.id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ data: user.favorite_ids });
});

// POST /api/users/favorites — add to favorites
export const POST = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const { movie_id } = await req.json();

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.favorite_ids.includes(movie_id)) {
    return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
  }

  const updated = await updateUser(session.user.id, {
    favorite_ids: [...user.favorite_ids, movie_id],
  });

  return NextResponse.json({ data: updated.favorite_ids });
});

// DELETE /api/users/favorites
export const DELETE = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const { movie_id } = await req.json();

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updated = await updateUser(session.user.id, {
    favorite_ids: user.favorite_ids.filter((id) => id !== movie_id),
  });

  return NextResponse.json({ data: updated.favorite_ids });
});