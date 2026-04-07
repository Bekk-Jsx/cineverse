import * as movieRepo from '../repositories/movie.repository';
import { esClient } from '../config/elasticsearch.config';
import { getCache, setCache, deleteCache, CACHE_KEYS } from './cache.service';
import type { MovieDocument } from '../../frontend/types';

// Get paginated movies — with Redis cache
export const getMovies = async (page: number = 1) => {
  const cacheKey = CACHE_KEYS.movies(page);

  // Check cache first
  const cached = await getCache<{ movies: MovieDocument[]; total: number }>(cacheKey);
  if (cached) return cached;

  // Cache miss → fetch from CouchDB
  const result = await movieRepo.getMovies(page);

  // Store in cache
  await setCache(cacheKey, result);

  return result;
};

// Get single movie — with Redis cache
export const getMovieById = async (id: string): Promise<MovieDocument | null> => {
  const cacheKey = CACHE_KEYS.movie(id);

  const cached = await getCache<MovieDocument>(cacheKey);
  if (cached) return cached;

  const movie = await movieRepo.getMovieById(id);
  if (!movie) return null;

  await setCache(cacheKey, movie);
  return movie;
};

// Search movies via Elasticsearch
export const searchMovies = async (
  query: string,
  filters: {
    genre?: string;
    year?: number;
    minRating?: number;
    language?: string;
  } = {}
) => {
  const cacheKey = CACHE_KEYS.search(`${query}_${JSON.stringify(filters)}`);

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Build ES query
  const must: object[] = [];
  const filter: object[] = [];

  // Full text search on title + overview
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^3', 'overview', 'tagline'], // title weighted 3x
        fuzziness: 'AUTO',                           // handles typos
      },
    });
  }

  // Filters
  if (filters.genre) {
    filter.push({
      nested: {
        path: 'genres',
        query: { term: { 'genres.name': filters.genre } },
      },
    });
  }

  if (filters.year) {
    filter.push({
      range: {
        release_date: {
          gte: `${filters.year}-01-01`,
          lte: `${filters.year}-12-31`,
        },
      },
    });
  }

  if (filters.minRating) {
    filter.push({
      range: { vote_average: { gte: filters.minRating } },
    });
  }

  if (filters.language) {
    filter.push({ term: { original_language: filters.language } });
  }

  const response = await esClient.search({
    index: 'movies',
    query: {
      bool: { must, filter },
    },
    size: 20,
  });

  const results = response.hits.hits.map((hit) => ({
    id: hit._id,
    score: hit._score,
    ...(hit._source ?? {}),
  }));

  await setCache(cacheKey, results);
  return results;
};

// Create movie — invalidate cache + index in ES
export const createMovie = async (
  data: Omit<MovieDocument, '_id' | '_rev' | 'created_at' | 'updated_at'>
): Promise<MovieDocument> => {
  const movie = await movieRepo.createMovie(data);

  // Index in Elasticsearch
  await esClient.index({
    index: 'movies',
    id: movie._id,
    document: {
      tmdb_id: movie.tmdb_id,
      title: movie.title,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      genres: movie.genres,
    },
  });

  // Invalidate movies list cache
  await deleteCache(CACHE_KEYS.movies(1));

  return movie;
};

// Update movie — invalidate cache + update ES
export const updateMovie = async (
  id: string,
  updates: Partial<MovieDocument>
): Promise<MovieDocument> => {
  const movie = await movieRepo.updateMovie(id, updates);

  // Update in ES
  await esClient.update({
    index: 'movies',
    id: `movie_${id}`,
    doc: updates,
  });

  // Invalidate this movie's cache
  await deleteCache(CACHE_KEYS.movie(id));

  return movie;
};

// Delete movie — invalidate cache + remove from ES
export const deleteMovie = async (id: string): Promise<void> => {
  await movieRepo.deleteMovie(id);

  // Remove from ES
  await esClient.delete({
    index: 'movies',
    id: `movie_${id}`,
  });

  // Invalidate cache
  await deleteCache(CACHE_KEYS.movie(id));
};