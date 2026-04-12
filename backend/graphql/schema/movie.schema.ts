import { gql } from 'graphql-tag';

export const movieTypeDefs = gql`
  type Genre {
    id: Int!
    name: String!
  }

  type ProductionCompany {
    id: Int!
    name: String!
  }

  type Movie {
    id: ID!
    tmdb_id: Int!
    title: String!
    original_title: String!
    original_language: String!
    overview: String!
    tagline: String
    status: String!
    homepage: String
    budget: Int!
    revenue: Int!
    runtime: Float!
    popularity: Float!
    vote_average: Float!
    vote_count: Int!
    release_date: String
    genres: [Genre!]!
    production_companies: [ProductionCompany!]!
  }

  type MoviesResult {
    data: [Movie!]!
    pagination: Pagination!
  }

  type Pagination {
    page: Int!
    total: Int!
    totalPages: Int!
  }

  type SearchResult {
    data: [Movie!]!
    total: Int!
    page: Int!
  }

  type Query {
    movie(id: ID!): Movie
    movies(page: Int): MoviesResult!
    searchMovies(
      query: String!
      genre: String
      year: Int
      minRating: Float
      language: String
      page: Int
      limit: Int
    ): SearchResult!
  }

  type Mutation {
    createMovie(input: MovieInput!): Movie!
    updateMovie(id: ID!, input: MovieInput!): Movie!
    deleteMovie(id: ID!): Boolean!
  }

  input MovieInput {
    tmdb_id: Int!
    title: String!
    original_title: String!
    original_language: String!
    overview: String!
    tagline: String
    status: String!
    homepage: String
    budget: Int!
    revenue: Int!
    runtime: Float!
    popularity: Float!
    vote_average: Float!
    vote_count: Int!
    release_date: String
  }
`;