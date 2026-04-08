'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { GET_MOVIES } from '@/frontend/services/graphql/queries/movies.queries';
import MovieCard from '@/frontend/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface MovieResult {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genres: { name: string }[];
}

const MoviesPage = () => {
  const [page, setPage] = useState(1);

    const { data, loading, error } = useQuery<{
    movies: {
        data: {
        id: string;
        title: string;
        overview: string;
        vote_average: number;
        release_date: string;
        genres: { name: string }[];
        }[];
        pagination: {
        page: number;
        total: number;
        totalPages: number;
        };
    };
    }>(GET_MOVIES, {
    variables: { page: 1 },
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

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">All Movies</h1>
        <span className="text-neutral-400 text-sm">
          {pagination?.total} movies total
        </span>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.map((movie: MovieResult) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 py-8">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-neutral-400">
          Page {page} of {pagination?.totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={page === pagination?.totalPages}
        >
          Next
        </Button>
      </div>

    </div>
  );
};

export default MoviesPage;