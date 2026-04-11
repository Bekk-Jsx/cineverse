import { db } from '../config/couchdb.config';
import type { ReviewDocument } from '../../frontend/types';

// Get all reviews for a movie
export const getMovieReviews = async (
    movieId: string
): Promise<ReviewDocument[]> => {
    const result = await db.find({
        selector: {
            type: 'review',
            movie_id: `movie_${movieId}`,
        },
        sort: [{ created_at: 'desc' }],
    });

    return result.docs as ReviewDocument[];
};

// Get single review
export const getReviewById = async (
    id: string
): Promise<ReviewDocument | null> => {
    try {
        const review = await db.get(id);
        return review as ReviewDocument;
    } catch {
        return null;
    }
};

// Create review
export const createReview = async (
    data: Omit<ReviewDocument, '_id' | '_rev' | 'created_at' | 'updated_at'>
): Promise<ReviewDocument> => {
    const now = new Date().toISOString();
    const _id = `review_${Date.now()}`;

    const review: ReviewDocument = {
        ...data,
        _id,
        created_at: now,
        updated_at: now,
    };

    await db.insert(review);
    return review;
};

// Update review
export const updateReview = async (
    id: string,
    updates: Partial<ReviewDocument>
): Promise<ReviewDocument> => {
    const existing = await db.get(id);

    const updated: ReviewDocument = {
        ...(existing as ReviewDocument),
        ...updates,
        _id: id,
        _rev: existing._rev,
        updated_at: new Date().toISOString(),
    };

    await db.insert(updated);
    return updated;
};

// Delete review
export const deleteReview = async (id: string): Promise<void> => {
    const existing = await db.get(id);
    await db.destroy(id, existing._rev!);
};

// Check if user already reviewed a movie
export const getUserReview = async (
    userId: string,
    movieId: string
): Promise<ReviewDocument | null> => {
    const result = await db.find({
        selector: {
            type: 'review',
            user_id: userId,
            movie_id: `movie_${movieId}`,
        },
        limit: 1,
    });

    if (result.docs.length === 0) return null;
    return result.docs[0] as ReviewDocument;
};