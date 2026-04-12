'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_MOVIES } from '@/frontend/services/graphql/queries/movies.queries';
import MovieCard from '@/frontend/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface MovieResult {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genres: { name: string }[];
}

interface MoviesQuery {
  movies: {
    data: MovieResult[];
    pagination: {
      page: number;
      total: number;
      totalPages: number;
    };
  };
}

// ─── Home Page ────────────────────────────────────────────────────────────

const HomePage = () => {
  const [page, setPage] = useState(1);

  const { data, loading, error } = useQuery<MoviesQuery>(GET_MOVIES, {
    variables: { page },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error text-center py-12">
        Something went wrong. Please try again.
      </div>
    );
  }

  const movies = data?.movies?.data ?? [];
  const pagination = data?.movies?.pagination;

  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-primary-500">Cineverse</span>
        </h1>
        <p className="text-neutral-400 text-lg">
          Discover your next favorite movie
        </p>
      </div>

      {/* Movies Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Top Rated Movies</h2>
          <span className="text-neutral-400 text-sm">
            {pagination?.total?.toLocaleString()} movies total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map((movie: MovieResult) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-8">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-neutral-400">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default HomePage;