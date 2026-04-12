'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
} from '@/frontend/services/api/userApi';

export const useUserActions = (movieId: string) => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const fullMovieId = `movie_${movieId}`;

    // Fetch watchlist
    const { data: watchlistData } = useQuery({
        queryKey: ['watchlist'],
        queryFn: getWatchlist,
        enabled: !!session,
    });

    // Fetch favorites
    const { data: favoritesData } = useQuery({
        queryKey: ['favorites'],
        queryFn: getFavorites,
        enabled: !!session,
    });

    const watchlist: { movie_id: string }[] = watchlistData?.data ?? [];
    const favorites: string[] = favoritesData?.data ?? [];

    const isInWatchlist = watchlist.some((item) => item.movie_id === fullMovieId);
    const isFavorite = favorites.includes(fullMovieId);

    // Watchlist mutations
    const watchlistMutation = useMutation({
        mutationFn: async () => {
            if (isInWatchlist) return removeFromWatchlist(fullMovieId);
            return addToWatchlist(fullMovieId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        },
    });

    // Favorites mutations
    const favoritesMutation = useMutation({
        mutationFn: async () => {
            if (isFavorite) return removeFromFavorites(fullMovieId);
            return addToFavorites(fullMovieId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });

    return {
        isLoggedIn: !!session,
        isInWatchlist,
        isFavorite,
        toggleWatchlist: () => watchlistMutation.mutate(),
        toggleFavorite: () => favoritesMutation.mutate(),
        watchlistLoading: watchlistMutation.isPending,
        favoriteLoading: favoritesMutation.isPending,
    };
};