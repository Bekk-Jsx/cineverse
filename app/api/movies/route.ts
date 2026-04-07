import { getAllMovies, createMovie } from '@/backend/controllers/movies.controller';
import { withAuth } from '@/backend/middlewares/auth.middleware';
import { withRateLimit } from '@/backend/middlewares/rateLimit.middleware';

// GET /api/movies — public
export const GET = withRateLimit(getAllMovies, 100);

// POST /api/movies — admin only
export const POST = withRateLimit(
  withAuth(createMovie, ['admin']),
  20
);