'use client';

import { useQuery } from '@apollo/client/react';
import { GET_MOVIES } from '@/frontend/services/graphql/queries/movies.queries';
import MovieCard from '@/frontend/components/movies/MovieCard';
import { Loader2 } from 'lucide-react';

interface MovieResult {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genres: { name: string }[];
}

const HomePage = () => {
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
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Top Rated Movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map((movie: MovieResult) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage;