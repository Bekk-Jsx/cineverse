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

// GET /api/users/watchlist
export const GET = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const user = await getUserById(session.user.id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ data: user.watchlist });
});

// POST /api/users/watchlist — add movie to watchlist
export const POST = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const { movie_id } = await req.json();

  if (!movie_id) {
    return NextResponse.json({ error: 'movie_id is required' }, { status: 400 });
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if already in watchlist
  const exists = user.watchlist.some((item) => item.movie_id === movie_id);
  if (exists) {
    return NextResponse.json({ error: 'Already in watchlist' }, { status: 409 });
  }

  const updated = await updateUser(session.user.id, {
    watchlist: [
      ...user.watchlist,
      { movie_id, added_at: new Date().toISOString() },
    ],
  });

  return NextResponse.json({ data: updated.watchlist });
});

// DELETE /api/users/watchlist — remove movie from watchlist
export const DELETE = withAuth(async (req: NextRequest) => {
  const session = (req as AuthenticatedRequest).auth;
  const { movie_id } = await req.json();

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updated = await updateUser(session.user.id, {
    watchlist: user.watchlist.filter((item) => item.movie_id !== movie_id),
  });

  return NextResponse.json({ data: updated.watchlist });
});