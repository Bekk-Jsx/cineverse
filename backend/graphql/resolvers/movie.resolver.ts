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
    // query { movie(id: "19995") { title } }
    movie: async (_: unknown, { id }: { id: string }) => {
      const movie = await moviesService.getMovieById(id);
      if (!movie) return null;
      return mapMovie(movie);
    },

    // query { movies(page: 1) { data { title } pagination { total } } }
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

    // query { searchMovies(query: "avatar", genre: "Action") { title } }
    searchMovies: async (
      _: unknown,
      args: {
        query: string;
        genre?: string;
        year?: number;
        minRating?: number;
        language?: string;
      }
    ) => {
      const { query, ...filters } = args;
      return moviesService.searchMovies(query, filters);
    },
  },

  Mutation: {
    // mutation { createMovie(input: {...}) { id title } }
    createMovie: async (_: unknown, { input }: { input: Omit<MovieDocument, '_id' | '_rev' | 'created_at' | 'updated_at'> }) => {
      const movie = await moviesService.createMovie(input);
      return mapMovie(movie);
    },

    // mutation { updateMovie(id: "19995", input: {...}) { title } }
    updateMovie: async (_: unknown, { id, input }: { id: string; input: Partial<MovieDocument> }) => {
      const movie = await moviesService.updateMovie(id, input);
      return mapMovie(movie);
    },

    // mutation { deleteMovie(id: "19995") }
    deleteMovie: async (_: unknown, { id }: { id: string }) => {
      await moviesService.deleteMovie(id);
      return true;
    },
  },
};