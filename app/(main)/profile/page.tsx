'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getProfile, updateProfile, getWatchlist, getFavorites } from '@/frontend/services/api/userApi';
import { Button } from '@/components/ui/button';
import { Loader2, User, Film, Heart, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';

const ProfilePage = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!session,
  });

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
    enabled: !!session,
  });

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!session,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const profile = profileData?.data;
  const watchlist = watchlistData?.data ?? [];
  const favorites = favoritesData?.data ?? [];

  return (
    <div className="space-y-8">

      {/* Profile Header */}
      <div className="bg-neutral-900 rounded-xl p-6 flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-neutral-400" />
        </div>

        <div className="flex-1 space-y-3">
          {isEditing ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-neutral-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="New username"
              />
              <Button
                size="sm"
                onClick={() => updateMutation.mutate({ username })}
                disabled={updateMutation.isPending}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {profile?.username}
              </h1>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setUsername(profile?.username ?? '');
                  setIsEditing(true);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <p className="text-neutral-400 text-sm">{profile?.email}</p>

          <div className="flex items-center gap-2">
            <span className="bg-primary-900 text-primary-500 px-3 py-1 rounded-full text-xs">
              {profile?.role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{watchlist.length}</p>
            <p className="text-neutral-400 text-xs">Watchlist</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{favorites.length}</p>
            <p className="text-neutral-400 text-xs">Favorites</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">

        {/* Watchlist */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-white">Watchlist</h2>
          </div>

          {watchlist.length === 0 ? (
            <p className="text-neutral-400 text-sm">
              No movies in watchlist yet.{' '}
              <Link href="/movies" className="text-primary-500 hover:underline">
                Browse movies
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {watchlist.map((item: { movie_id: string; added_at: string }) => (
                <Link
                  key={item.movie_id}
                  href={`/movies/${item.movie_id.replace('movie_', '')}`}
                  className="bg-neutral-900 hover:bg-neutral-800 transition-colors rounded-lg p-4 flex items-center gap-3"
                >
                  <Film className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span className="text-white text-sm line-clamp-1">
                    {item.movie_id.replace('movie_', '')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-error" />
            <h2 className="text-xl font-semibold text-white">Favorites</h2>
          </div>

          {favorites.length === 0 ? (
            <p className="text-neutral-400 text-sm">
              No favorites yet.{' '}
              <Link href="/movies" className="text-primary-500 hover:underline">
                Browse movies
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favorites.map((movieId: string) => (
                <Link
                  key={movieId}
                  href={`/movies/${movieId.replace('movie_', '')}`}
                  className="bg-neutral-900 hover:bg-neutral-800 transition-colors rounded-lg p-4 flex items-center gap-3"
                >
                  <Heart className="w-5 h-5 text-error flex-shrink-0" />
                  <span className="text-white text-sm line-clamp-1">
                    {movieId.replace('movie_', '')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;