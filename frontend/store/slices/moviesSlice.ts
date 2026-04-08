import { create } from 'zustand';
import type { MovieDocument } from '@/frontend/types';

interface MoviesState {
  selectedMovie: MovieDocument | null;
  searchQuery: string;
  filters: {
    genre?: string;
    year?: number;
    minRating?: number;
    language?: string;
  };
  setSelectedMovie: (movie: MovieDocument | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: MoviesState['filters']) => void;
  clearFilters: () => void;
}

export const useMoviesStore = create<MoviesState>((set) => ({
  selectedMovie: null,
  searchQuery: '',
  filters: {},
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));