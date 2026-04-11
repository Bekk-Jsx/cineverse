import type { NextRequest } from 'next/server';
import { getMovieReviews, createReview } from '@/backend/controllers/reviews.controller';
import { withAuth } from '@/backend/middlewares/auth.middleware';
import { withRateLimit } from '@/backend/middlewares/rateLimit.middleware';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/movies/:id/reviews — public
export const GET = withRateLimit(
    async (req: NextRequest, context: unknown) => {
        const { id } = await (context as RouteContext).params;
        return getMovieReviews(req, id);
    },
    100
);

// POST /api/movies/:id/reviews — authenticated
export const POST = withRateLimit(
    withAuth(
        async (req: NextRequest, context: unknown) => {
            const { id } = await (context as RouteContext).params;
            return createReview(req, id);
        }
    ),
    20
);