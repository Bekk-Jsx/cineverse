import type { CastMember, CrewMember } from './person.types';

// CouchDB document — links a movie to its full cast & crew
export interface CreditDocument {
  _id: string;              // e.g. "credit_19995"
  _rev?: string;
  type: 'credit';
  movie_id: string;         // reference → MovieDocument._id
  tmdb_movie_id: number;
  cast: CastMember[];
  crew: CrewMember[];
  created_at: string;
  updated_at: string;
}