import * as moviesService from '../../services/movies.service';
import type { MovieDocument } from '../../../frontend/types';

// Helper — maps CouchDB document to GraphQL type
const mapMovie = (movie: MovieDocument) => ({
  id: movie._id.replace('movie_', ''),
  tmdb_id: movie.tmdb_id,
  title: movie.title,
  original_title: movie.original_title,
  original_language: movie.original_language,
  overview: movie.overview,
  tagline: movie.tagline,
  status: movie.status,
  homepage: movie.homepage,
  budget: movie.budget,
  revenue: movie.revenue,
  runtime: movie.runtime,
  popularity: movie.popularity,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  release_date: movie.release_date,
  genres: movie.genres,
  production_companies: movie.production_companies,
});

export const movieResolvers = {
  Query: {
    movie: async (_: unknown, { id }: { id: string }) => {
      const movie = await moviesService.getMovieById(id);
      if (!movie) return null;
      return mapMovie(movie);
    },

    movies: async (_: unknown, { page = 1 }: { page: number }) => {
      const result = await moviesService.getMovies(page);
      return {
        data: result.movies.map(mapMovie),
        pagination: {
          page,
          total: result.total,
          totalPages: Math.ceil(result.total / 20),
        },
      };
    },

    // Updated — now returns SearchResult with pagination
    searchMovies: async (
      _: unknown,
      args: {
        query: string;
        genre?: string;
        year?: number;
        minRating?: number;
        language?: string;
        page?: number;
        limit?: number;
      }
    ) => {
      const { query, ...filters } = args;
      const result = await moviesService.searchMovies(query, filters) as {
        data: object[];
        total: number | { value: number };
        page: number;
      };
      return {
        data: Array.isArray(result) ? result : result.data,
        total: Array.isArray(result) ? result.length : result.total,
        page: filters.page ?? 1,
      };
    },
  },

  Mutation: {
    createMovie: async (_: unknown, { input }: { input: Omit<MovieDocument, '_id' | '_rev' | 'created_at' | 'updated_at'> }) => {
      const movie = await moviesService.createMovie(input);
      return mapMovie(movie);
    },

    updateMovie: async (_: unknown, { id, input }: { id: string; input: Partial<MovieDocument> }) => {
      const movie = await moviesService.updateMovie(id, input);
      return mapMovie(movie);
    },

    deleteMovie: async (_: unknown, { id }: { id: string }) => {
      await moviesService.deleteMovie(id);
      return true;
    },
  },
};