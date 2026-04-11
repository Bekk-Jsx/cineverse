// All user-related API calls

export const getProfile = async () => {
  const res = await fetch('/api/users/profile');
  return res.json();
};

export const updateProfile = async (data: { username?: string; avatar_url?: string }) => {
  const res = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getWatchlist = async () => {
  const res = await fetch('/api/users/watchlist');
  return res.json();
};

export const addToWatchlist = async (movie_id: string) => {
  const res = await fetch('/api/users/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie_id }),
  });
  return res.json();
};

export const removeFromWatchlist = async (movie_id: string) => {
  const res = await fetch('/api/users/watchlist', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie_id }),
  });
  return res.json();
};

export const getFavorites = async () => {
  const res = await fetch('/api/users/favorites');
  return res.json();
};

export const addToFavorites = async (movie_id: string) => {
  const res = await fetch('/api/users/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie_id }),
  });
  return res.json();
};

export const removeFromFavorites = async (movie_id: string) => {
  const res = await fetch('/api/users/favorites', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie_id }),
  });
  return res.json();
};