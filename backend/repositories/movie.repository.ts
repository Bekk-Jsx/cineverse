import { db } from '../config/couchdb.config';
import type { MovieDocument } from '../../frontend/types';

// Get all movies with pagination
export const getMovies = async (
  page: number = 1,
  limit: number = 20
): Promise<{ movies: MovieDocument[]; total: number }> => {
  const skip = (page - 1) * limit;

  const result = await db.find({
    selector: { type: 'movie' },
    limit,
    skip,
    sort: [{ vote_average: 'desc' }],
  });

  // Get total count
  const countResult = await db.find({
    selector: { type: 'movie' },
    fields: ['_id'],
    limit: 999999,
  });

  return {
    movies: result.docs as MovieDocument[],
    total: countResult.docs.length,
  };
};

// Get single movie by ID
export const getMovieById = async (id: string): Promise<MovieDocument | null> => {
  try {
    const movie = await db.get(`movie_${id}`);
    return movie as MovieDocument;
  } catch {
    return null;
  }
};

// Create movie
export const createMovie = async (
  data: Omit<MovieDocument, '_id' | '_rev' | 'created_at' | 'updated_at'>
): Promise<MovieDocument> => {
  const now = new Date().toISOString();
  const movie: MovieDocument = {
    ...data,
    _id: `movie_${data.tmdb_id}`,
    created_at: now,
    updated_at: now,
  };

  await db.insert(movie);
  return movie;
};

// Update movie
export const updateMovie = async (
  id: string,
  updates: Partial<MovieDocument>
): Promise<MovieDocument> => {
  const existing = await db.get(`movie_${id}`);

  const updated: MovieDocument = {
    ...(existing as MovieDocument),
    ...updates,
    _id: `movie_${id}`,
    _rev: existing._rev,
    updated_at: new Date().toISOString(),
  };

  await db.insert(updated);
  return updated;
};

// Delete movie
export const deleteMovie = async (id: string): Promise<void> => {
  const existing = await db.get(`movie_${id}`);
  await db.destroy(`movie_${id}`, existing._rev!);
};