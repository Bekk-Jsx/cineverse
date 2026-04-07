import { searchMovies } from '@/backend/controllers/movies.controller';
import { withRateLimit } from '@/backend/middlewares/rateLimit.middleware';

// GET /api/movies/search — public
export const GET = withRateLimit(searchMovies, 50);