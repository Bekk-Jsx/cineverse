'use client';

import { useQuery } from '@apollo/client/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { SEARCH_MOVIES } from '@/frontend/services/graphql/queries/movies.queries';
import MovieCard from '@/frontend/components/movies/MovieCard';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { useMoviesStore } from '@/frontend/store';

// ─── Types ────────────────────────────────────────────────────────────────

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

// ─── Search Page ──────────────────────────────────────────────────────────

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useMoviesStore();
  const query = searchParams.get('q') ?? '';
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  const { data, loading, error } = useQuery<{
    searchMovies: {
      data: MovieResult[];
      total: number;
      page: number;
    };
  }>(SEARCH_MOVIES, {
    variables: { query, ...filters, page },
    skip: !query,
  });

  const results = data?.searchMovies?.data ?? [];
  const total = data?.searchMovies?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery}`);
    }
  };

  return (
    <div className="space-y-6">

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies..."
          className="flex-1 bg-neutral-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button type="submit">Search</Button>
      </form>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Search Results</h1>
          {query && (
            <p className="text-neutral-400 mt-1">
              {loading ? 'Searching...' : `${total} results for "${query}"`}
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
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Genre</label>
            <select
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, genre: e.target.value || undefined })); }}
            >
              <option value="">All Genres</option>
              {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Science Fiction', 'Thriller'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Year</label>
            <input
              type="number"
              placeholder="e.g. 2020"
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, year: e.target.value ? parseInt(e.target.value) : undefined })); }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Min Rating</label>
            <select
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, minRating: e.target.value ? parseFloat(e.target.value) : undefined })); }}
            >
              <option value="">Any Rating</option>
              {[5, 6, 7, 8, 9].map((r) => (
                <option key={r} value={r}>{r}+</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Language</label>
            <select
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 text-sm"
              onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, language: e.target.value || undefined })); }}
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((movie: MovieResult) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-neutral-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

// ─── Wrapper ──────────────────────────────────────────────────────────────

const SearchPageWrapper = () => (
  <Suspense fallback={
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  }>
    <SearchPage />
  </Suspense>
);

export default SearchPageWrapper;