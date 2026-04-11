'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery as useGqlQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { GET_MOVIE, GET_MOVIE_CREDITS } from '@/frontend/services/graphql/queries/movies.queries';
import { Loader2, Star, Clock, Globe, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────

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

interface CastMember {
  tmdb_id: number;
  name: string;
  character: string;
  order: number;
}

interface CrewMember {
  tmdb_id: number;
  name: string;
  department: string;
  job: string;
}

interface Review {
  _id: string;
  username: string;
  rating: number;
  content: string;
  created_at: string;
  user_id: string;
}

// ─── Reviews Section ──────────────────────────────────────────────────────

const ReviewsSection = ({ movieId }: { movieId: string }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', movieId],
    queryFn: async () => {
      const res = await fetch(`/api/movies/${movieId}/reviews`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/movies/${movieId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', movieId] });
      setContent('');
      setRating(5);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', movieId] });
    },
  });

  const reviews: Review[] = reviewsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Reviews ({reviews.length})
        </h2>
        {session && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-neutral-900 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-medium">Your Review</h3>
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Rating: {rating}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-neutral-400 text-sm">Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Write your review..."
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !content.trim()}
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-neutral-400 text-sm">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-neutral-900 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{review.username}</span>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{review.rating}/10</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 text-xs">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {(session?.user.id === review.user_id || session?.user.role === 'admin') && (
                    <button
                      onClick={() => deleteMutation.mutate(review._id)}
                      className="text-error hover:text-error/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Movie Detail Page ────────────────────────────────────────────────────

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useGqlQuery<{ movie: MovieDetail }>(GET_MOVIE, {
    variables: { id },
  });

  const { data: creditsData } = useGqlQuery<{
    movieCredits: { cast: CastMember[]; crew: CrewMember[] };
  }>(GET_MOVIE_CREDITS, {
    variables: { movieId: id },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data?.movie) {
    return <div className="text-error text-center py-12">Movie not found.</div>;
  }

  const movie = data.movie;
  const credits = creditsData?.movieCredits;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtime = `${Math.floor(movie.runtime / 60)}h ${Math.floor(movie.runtime % 60)}m`;
  const budget = movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A';
  const revenue = movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A';
  const director = credits?.crew.find((c) => c.job === 'Director');

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
            <span className="text-white font-bold text-xl">{movie.vote_average.toFixed(1)}</span>
            <span className="text-neutral-400 text-sm">({movie.vote_count.toLocaleString()})</span>
          </div>
        </div>

        {movie.tagline && (
          <p className="text-primary-500 italic text-lg">&quot;{movie.tagline}&quot;</p>
        )}

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
          <span className="bg-neutral-800 px-2 py-1 rounded text-xs">{movie.status}</span>
          {director && (
            <span>
              Directed by{' '}
              <Link href={`/actors/${director.tmdb_id}`} className="text-primary-500 hover:underline">
                {director.name}
              </Link>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
            <span key={genre.id} className="bg-primary-900 text-primary-500 px-3 py-1 rounded-full text-sm">
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

      {/* Cast */}
      {credits?.cast && credits.cast.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {credits.cast.slice(0, 12).map((member) => (
              <Link
                key={member.tmdb_id}
                href={`/actors/${member.tmdb_id}`}
                className="bg-neutral-900 rounded-lg p-3 hover:bg-neutral-800 transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg font-bold">{member.name.charAt(0)}</span>
                </div>
                <p className="text-white text-sm font-medium line-clamp-1">{member.name}</p>
                <p className="text-neutral-400 text-xs line-clamp-1">{member.character}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Crew */}
      {credits?.crew && credits.crew.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Key Crew</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {credits.crew
              .filter((c) => ['Director', 'Producer', 'Screenplay', 'Original Music Composer'].includes(c.job))
              .slice(0, 8)
              .map((member) => (
                <Link
                  key={`${member.tmdb_id}-${member.job}`}
                  href={`/actors/${member.tmdb_id}`}
                  className="bg-neutral-900 rounded-lg p-3 hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-white text-sm font-medium">{member.name}</p>
                  <p className="text-neutral-400 text-xs">{member.job}</p>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Production Companies */}
      {movie.production_companies.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Production Companies</h2>
          <div className="flex flex-wrap gap-2">
            {movie.production_companies.map((company) => (
              <span key={company.id} className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm">
                {company.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewsSection movieId={id} />

    </div>
  );
};

export default MovieDetailPage;