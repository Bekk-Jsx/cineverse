// Cast member inside a movie document
export interface CastMember {
  cast_id: number;
  credit_id: string;
  tmdb_id: number;          // person's TMDB id
  name: string;
  character: string;
  gender: number;           // 0: unknown, 1: female, 2: male
  order: number;            // billing order
}

// Crew member inside a movie document
export interface CrewMember {
  credit_id: string;
  tmdb_id: number;
  name: string;
  department: string;       // Directing, Writing, Production, etc.
  job: string;              // Director, Screenplay, Producer, etc.
  gender: number;
}

// Standalone Person CouchDB document
export interface PersonDocument {
  _id: string;              // e.g. "person_2710"
  _rev?: string;
  type: 'person';
  tmdb_id: number;
  name: string;
  gender: number;
  known_for_department: string;
  movie_ids: string[];      // references to MovieDocument _ids
  created_at: string;
  updated_at: string;
}