'use client';

import { useQuery as useGqlQuery } from '@apollo/client/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { GET_PERSON } from '@/frontend/services/graphql/queries/movies.queries';
import { Loader2, Film, User } from 'lucide-react';
import Link from 'next/link';

interface Person {
  id: string;
  tmdb_id: number;
  name: string;
  gender: number;
  known_for_department: string;
  movie_ids: string[];
}

interface Movie {
  _id: string;
  title: string;
  vote_average: number;
  release_date: string;
}

const genderLabel = (gender: number): string => {
  switch (gender) {
    case 1: return 'Female';
    case 2: return 'Male';
    default: return 'Unknown';
  }
};

const PersonDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useGqlQuery<{ person: Person }>(GET_PERSON, {
    variables: { id },
  });

  // Fetch movie details for this person
  const { data: moviesData } = useQuery({
    queryKey: ['person-movies', id],
    queryFn: async () => {
      if (!data?.person?.movie_ids) return [];

      // Fetch first 12 movies
      const movieIds = data.person.movie_ids.slice(0, 12);
      const results = await Promise.all(
        movieIds.map(async (movieId) => {
          const res = await fetch(`/api/movies/${movieId.replace('movie_', '')}`);
          const json = await res.json();
          return json.data as Movie;
        })
      );
      return results.filter(Boolean);
    },
    enabled: !!data?.person?.movie_ids,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data?.person) {
    return (
      <div className="text-error text-center py-12">
        Person not found.
      </div>
    );
  }

  const person = data.person;
  const movies: Movie[] = moviesData ?? [];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
          <User className="w-12 h-12 text-neutral-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white">{person.name}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-primary-900 text-primary-500 px-3 py-1 rounded-full">
              {person.known_for_department}
            </span>
            <span className="text-neutral-400">
              {genderLabel(person.gender)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <Film className="w-4 h-4" />
            <span>{person.movie_ids.length} movies</span>
          </div>
        </div>
      </div>

      {/* Movies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Known For</h2>
        {movies.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <Link
                key={movie._id}
                href={`/movies/${movie._id.replace('movie_', '')}`}
                className="bg-neutral-900 hover:bg-neutral-800 transition-colors rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-white text-sm font-medium line-clamp-2">
                    {movie.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>
                    {movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : 'N/A'}
                  </span>
                  <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PersonDetailPage;