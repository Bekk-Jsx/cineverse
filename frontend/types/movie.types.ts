// Raw CSV genre shape (stored as JSON string in CSV)
export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  iso_639_1: string;
  name: string;
}

export interface Keyword {
  id: number;
  name: string;
}

// CouchDB document — every doc needs _id and _rev
export interface MovieDocument {
  _id: string;               // e.g. "movie_19995"
  _rev?: string;             // managed by CouchDB — optional on create
  type: 'movie';             // document type discriminator
  tmdb_id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  tagline: string;
  status: string;
  homepage: string;
  budget: number;
  revenue: number;
  runtime: number;
  popularity: number;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genres: Genre[];
  keywords: Keyword[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  created_at: string;
  updated_at: string;
}