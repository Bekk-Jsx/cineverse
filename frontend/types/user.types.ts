export type UserRole = 'admin' | 'moderator' | 'user';

export interface WatchlistItem {
  movie_id: string;         // reference → MovieDocument._id
  added_at: string;
}

export interface UserDocument {
  _id: string;              // e.g. "user_abc123"
  _rev?: string;
  type: 'user';
  email: string;
  password_hash: string;
  username: string;
  role: UserRole;
  avatar_url?: string;
  watchlist: WatchlistItem[];
  favorite_ids: string[];   // references → MovieDocument._ids
  created_at: string;
  updated_at: string;
}