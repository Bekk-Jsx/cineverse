import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as reviewsService from '../services/reviews.service';
import type { AuthenticatedRequest } from '../types/auth.request.types';

// GET /api/movies/:id/reviews
export const getMovieReviews = async (
    _req: NextRequest,
    movieId: string
): Promise<NextResponse> => {
    const reviews = await reviewsService.getMovieReviews(movieId);
    return NextResponse.json({ data: reviews });
};

// POST /api/movies/:id/reviews
export const createReview = async (
    req: NextRequest,
    movieId: string
): Promise<NextResponse> => {
    const session = (req as AuthenticatedRequest).auth;
    const { rating, content } = await req.json();

    if (!rating || !content) {
        return NextResponse.json(
            { error: 'Rating and content are required' },
            { status: 400 }
        );
    }

    if (rating < 1 || rating > 10) {
        return NextResponse.json(
            { error: 'Rating must be between 1 and 10' },
            { status: 400 }
        );
    }

    try {
        const review = await reviewsService.createReview(
            session.user.id,
            session.user.username,
            movieId,
            { rating, content }
        );
        return NextResponse.json({ data: review }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create review' },
            { status: 400 }
        );
    }
};

// DELETE /api/reviews/:id
export const deleteReview = async (
    req: NextRequest,
    id: string
): Promise<NextResponse> => {
    const session = (req as AuthenticatedRequest).auth;

    try {
        await reviewsService.deleteReview(id, session.user.id, session.user.role);
        return NextResponse.json({ message: 'Review deleted' });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete review' },
            { status: 400 }
        );
    }
};