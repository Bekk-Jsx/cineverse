import * as reviewRepo from '../repositories/review.repository';
import { getCache, setCache, deleteCache } from './cache.service';
import type { ReviewDocument } from '../../frontend/types';
import { publish, CHANNELS } from './pubsub.service';

const REVIEW_CACHE_KEY = (movieId: string) => `reviews:${movieId}`;

export const getMovieReviews = async (
    movieId: string
): Promise<ReviewDocument[]> => {
    const cacheKey = REVIEW_CACHE_KEY(movieId);
    const cached = await getCache<ReviewDocument[]>(cacheKey);
    if (cached) return cached;

    const reviews = await reviewRepo.getMovieReviews(movieId);
    await setCache(cacheKey, reviews);
    return reviews;
};

export const createReview = async (
    userId: string,
    username: string,
    movieId: string,
    data: { rating: number; content: string }
): Promise<ReviewDocument> => {
    // Check if user already reviewed this movie
    const existing = await reviewRepo.getUserReview(userId, movieId);
    if (existing) throw new Error('You have already reviewed this movie');

    const review = await reviewRepo.createReview({
        type: 'review',
        movie_id: `movie_${movieId}`,
        user_id: userId,
        username,
        rating: data.rating,
        content: data.content,
        likes: 0,
    });

    // Publish to Redis → triggers GraphQL subscription
    await publish(CHANNELS.NEW_REVIEW, {
        movie_id: `movie_${movieId}`,
        username,
        rating: data.rating,
        content: data.content,
        created_at: review.created_at,
    });

    // Invalidate cache
    await deleteCache(REVIEW_CACHE_KEY(movieId));

    return review;
};

export const updateReview = async (
    id: string,
    userId: string,
    updates: { rating?: number; content?: string }
): Promise<ReviewDocument> => {
    const review = await reviewRepo.getReviewById(id);
    if (!review) throw new Error('Review not found');
    if (review.user_id !== userId) throw new Error('Unauthorized');

    const updated = await reviewRepo.updateReview(id, updates);
    await deleteCache(REVIEW_CACHE_KEY(review.movie_id.replace('movie_', '')));
    return updated;
};

export const deleteReview = async (
    id: string,
    userId: string,
    role: string
): Promise<void> => {
    const review = await reviewRepo.getReviewById(id);
    if (!review) throw new Error('Review not found');

    // User can delete own review, admin can delete any
    if (review.user_id !== userId && role !== 'admin') {
        throw new Error('Unauthorized');
    }

    await reviewRepo.deleteReview(id);
    await deleteCache(REVIEW_CACHE_KEY(review.movie_id.replace('movie_', '')));
};