'use client';

import { Bookmark, Heart } from 'lucide-react';
import { useUserActions } from '@/frontend/hooks/useUserActions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MovieActionsProps {
    movieId: string;
}

const MovieActions = ({ movieId }: MovieActionsProps) => {
    const {
        isLoggedIn,
        isInWatchlist,
        isFavorite,
        toggleWatchlist,
        toggleFavorite,
        watchlistLoading,
        favoriteLoading,
    } = useUserActions(movieId);

    if (!isLoggedIn) {
        return (
            <Link href="/login">
                <Button variant="outline" size="sm">
                    Login to save
                </Button>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-3">
            {/* Watchlist Button */}
            <button
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isInWatchlist
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
            >
                <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>

            {/* Favorite Button */}
            <button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFavorite
                        ? 'bg-error text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
            >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
        </div>
    );
};

export default MovieActions;