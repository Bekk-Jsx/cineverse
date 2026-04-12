import * as movieRepo from '../repositories/movie.repository';
import { esClient } from '../config/elasticsearch.config';
import { getCache, setCache, deleteCache, deleteCachePattern, CACHE_KEYS } from './cache.service';
import type { MovieDocument } from '../../frontend/types';

// ─── Types ────────────────────────────────────────────────────────────────

interface SearchResult {
  data: object[];
  total: number;
  page: number;
}

// ─── Get Movies ───────────────────────────────────────────────────────────

export const getMovies = async (page: number = 1) => {
  const cacheKey = CACHE_KEYS.movies(page);

  const cached = await getCache<{ movies: MovieDocument[]; total: number }>(cacheKey);
  if (cached) return cached;

  const result = await movieRepo.getMovies(page);
  await setCache(cacheKey, result);
  return result;
};

// ─── Get Single Movie ─────────────────────────────────────────────────────

export const getMovieById = async (id: string): Promise<MovieDocument | null> => {
  const cacheKey = CACHE_KEYS.movie(id);

  const cached = await getCache<MovieDocument>(cacheKey);
  if (cached) return cached;

  const movie = await movieRepo.getMovieById(id);
  if (!movie) return null;

  await setCache(cacheKey, movie);
  return movie;
};

// ─── Search Movies ────────────────────────────────────────────────────────

export const searchMovies = async (
  query: string,
  filters: {
    genre?: string;
    year?: number;
    minRating?: number;
    language?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<SearchResult> => {
  const { page = 1, limit = 20, ...restFilters } = filters;
  const cacheKey = CACHE_KEYS.search(`${query}_${JSON.stringify(filters)}`);

  const cached = await getCache<SearchResult>(cacheKey);
  if (cached) return cached;

  const must: object[] = [];
  const filter: object[] = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: ['title^3', 'overview', 'tagline'],
        fuzziness: 'AUTO',
      },
    });
  }

  if (restFilters.genre) {
    filter.push({
      nested: {
        path: 'genres',
        query: { term: { 'genres.name': restFilters.genre } },
      },
    });
  }

  if (restFilters.year) {
    filter.push({
      range: {
        release_date: {
          gte: `${restFilters.year}-01-01`,
          lte: `${restFilters.year}-12-31`,
        },
      },
    });
  }

  if (restFilters.minRating) {
    filter.push({
      range: { vote_average: { gte: restFilters.minRating } },
    });
  }

  if (restFilters.language) {
    filter.push({ term: { original_language: restFilters.language } });
  }

  const response = await esClient.search({
    index: 'movies',
    from: (page - 1) * limit,  // pagination offset
    size: limit,
    query: {
      bool: { must, filter },
    },
    // Only return fields we need
    _source: ['title', 'overview', 'vote_average', 'release_date', 'genres'],
  });

  // ES returns total as object { value: number, relation: string }
  const totalHits = response.hits.total;
  const totalCount = typeof totalHits === 'object' && totalHits !== null
    ? totalHits.value
    : totalHits ?? 0;

  const results: SearchResult = {
    data: response.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...(hit._source ?? {}),
    })),
    total: totalCount,
    page,
  };

  await setCache(cacheKey, results, 60); // shorter TTL for search
  return results;
};

// ─── Create Movie ─────────────────────────────────────────────────────────

export const createMovie = async (
  data: Omit<MovieDocument, '_id' | '_rev' | 'created_at' | 'updated_at'>
): Promise<MovieDocument> => {
  const movie = await movieRepo.createMovie(data);

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

  await deleteCachePattern('movies:page:*'); // invalidate ALL pages
  return movie;
};

// ─── Update Movie ─────────────────────────────────────────────────────────

export const updateMovie = async (
  id: string,
  updates: Partial<MovieDocument>
): Promise<MovieDocument> => {
  const movie = await movieRepo.updateMovie(id, updates);

  await esClient.update({
    index: 'movies',
    id: `movie_${id}`,
    doc: updates,
  });

  await deleteCache(CACHE_KEYS.movie(id));
  await deleteCachePattern('movies:page:*');
  return movie;
};

// ─── Delete Movie ─────────────────────────────────────────────────────────

export const deleteMovie = async (id: string): Promise<void> => {
  await movieRepo.deleteMovie(id);

  await esClient.delete({
    index: 'movies',
    id: `movie_${id}`,
  });

  await deleteCache(CACHE_KEYS.movie(id));
  await deleteCachePattern('movies:page:*');
};