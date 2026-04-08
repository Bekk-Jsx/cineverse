'use client';

import { useQuery } from '@apollo/client/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SEARCH_MOVIES } from '@/frontend/services/graphql/queries/movies.queries';
import MovieCard from '@/frontend/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal } from 'lucide-react';

interface MovieResult {
  id: string;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genres: { name: string }[];
}

interface Filters {
  genre?: string;
  year?: number;
  minRating?: number;
  language?: string;
}

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const { data, loading, error } = useQuery<{
    searchMovies: MovieResult[];
  }>(SEARCH_MOVIES, {
    variables: { query, ...filters },
    skip: !query,
  });

  const results = data?.searchMovies ?? [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Search Results
          </h1>
          {query && (
            <p className="text-neutral-400 mt-1">
              {loading ? 'Searching...' : `${results.length} results for "${query}"`}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-neutral-900 rounded-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Genre */}
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Genre</label>
            <select
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value || undefined }))}
            >
              <option value="">All Genres</option>
              {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Science Fiction', 'Thriller'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Year</label>
            <input
              type="number"
              placeholder="e.g. 2020"
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => setFilters((f) => ({
                ...f,
                year: e.target.value ? parseInt(e.target.value) : undefined
              }))}
            />
          </div>

          {/* Min Rating */}
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Min Rating</label>
            <select
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => setFilters((f) => ({
                ...f,
                minRating: e.target.value ? parseFloat(e.target.value) : undefined
              }))}
            >
              <option value="">Any Rating</option>
              {[5, 6, 7, 8, 9].map((r) => (
                <option key={r} value={r}>{r}+</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Language</label>
            <select
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value || undefined }))}
            >
              <option value="">All Languages</option>
              {['en', 'fr', 'es', 'de', 'it', 'ja', 'ko'].map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="text-error text-center py-12">
          Something went wrong. Please try again.
        </div>
      ) : !query ? (
        <div className="text-center py-12 text-neutral-400">
          Type something to search...
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          No movies found for &quot;{query}&quot;
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((movie: MovieResult) => (
            <MovieCard key={movie.id} {...movie} />
          ))}
        </div>
      )}

    </div>
  );
};

export default SearchPage;