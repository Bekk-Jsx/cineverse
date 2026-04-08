'use client';

import { useQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { GET_MOVIE } from '@/frontend/services/graphql/queries/movies.queries';
import { Loader2, Star, Clock, Globe, DollarSign } from 'lucide-react';

interface MovieDetail {
  id: string;
  title: string;
  original_title: string;
  overview: string;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  runtime: number;
  popularity: number;
  vote_average: number;
  vote_count: number;
  release_date: string;
  original_language: string;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
}

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<{ movie: MovieDetail }>(GET_MOVIE, {
    variables: { id },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data?.movie) {
    return (
      <div className="text-error text-center py-12">
        Movie not found.
      </div>
    );
  }

  const movie = data.movie;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtime = `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`;
  const budget = movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A';
  const revenue = movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A';

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
            {movie.original_title !== movie.title && (
              <p className="text-neutral-400 mt-1">{movie.original_title}</p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-lg">
            <Star className="w-5 h-5 text-warning fill-current" />
            <span className="text-white font-bold text-xl">
              {movie.vote_average.toFixed(1)}
            </span>
            <span className="text-neutral-400 text-sm">
              ({movie.vote_count.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Tagline */}
        {movie.tagline && (
          <p className="text-primary-500 italic text-lg">&quot;{movie.tagline}&quot;</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-6 text-neutral-400 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{runtime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>{movie.original_language.toUpperCase()}</span>
          </div>
          <span>{year}</span>
          <span className="bg-neutral-800 px-2 py-1 rounded text-xs">
            {movie.status}
          </span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
            <span
              key={genre.id}
              className="bg-primary-900 text-primary-500 px-3 py-1 rounded-full text-sm"
            >
              {genre.name}
            </span>
          ))}
        </div>
      </div>

      {/* Overview */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Overview</h2>
        <p className="text-neutral-300 leading-relaxed">{movie.overview}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Budget', value: budget, icon: DollarSign },
          { label: 'Revenue', value: revenue, icon: DollarSign },
          { label: 'Popularity', value: movie.popularity.toFixed(1), icon: Star },
          { label: 'Runtime', value: runtime, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-neutral-900 rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            <p className="text-white font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Production Companies */}
      {movie.production_companies.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Production Companies</h2>
          <div className="flex flex-wrap gap-2">
            {movie.production_companies.map((company) => (
              <span
                key={company.id}
                className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm"
              >
                {company.name}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MovieDetailPage;