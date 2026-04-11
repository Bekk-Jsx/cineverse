import type { NextRequest } from 'next/server';
import { deleteReview } from '@/backend/controllers/reviews.controller';
import { withAuth } from '@/backend/middlewares/auth.middleware';

type RouteContext = { params: Promise<{ id: string }> };

export const DELETE = withAuth(
    async (req: NextRequest, context: unknown) => {
        const { id } = await (context as RouteContext).params;
        return deleteReview(req, id);
    }
);