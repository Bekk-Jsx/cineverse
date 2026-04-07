import type { NextRequest } from 'next/server';
import { getMovie, updateMovie, deleteMovie } from '@/backend/controllers/movies.controller';
import { withAuth } from '@/backend/middlewares/auth.middleware';
import { withRateLimit } from '@/backend/middlewares/rateLimit.middleware';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/movies/:id — public
export const GET = withRateLimit(
  async (req: NextRequest, context: unknown) => {
    const { id } = await (context as RouteContext).params;
    return getMovie(req, id);
  },
  100
);

// PUT /api/movies/:id — admin only
export const PUT = withRateLimit(
  withAuth(
    async (req: NextRequest, context: unknown) => {
      const { id } = await (context as RouteContext).params;
      return updateMovie(req, id);
    },
    ['admin']
  ),
  20
);

// DELETE /api/movies/:id — admin only
export const DELETE = withRateLimit(
  withAuth(
    async (req: NextRequest, context: unknown) => {
      const { id } = await (context as RouteContext).params;
      return deleteMovie(req, id);
    },
    ['admin']
  ),
  20
);