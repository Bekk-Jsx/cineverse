import { gql } from '@apollo/client';

export const GET_MOVIES = gql`
  query GetMovies($page: Int) {
    movies(page: $page) {
      data {
        id
        title
        overview
        vote_average
        release_date
        genres {
          name
        }
      }
      pagination {
        page
        total
        totalPages
      }
    }
  }
`;

export const GET_MOVIE = gql`
  query GetMovie($id: ID!) {
    movie(id: $id) {
      id
      title
      original_title
      overview
      tagline
      status
      budget
      revenue
      runtime
      popularity
      vote_average
      vote_count
      release_date
      original_language
      genres {
        id
        name
      }
      production_companies {
        id
        name
      }
    }
  }
`;

export const SEARCH_MOVIES = gql`
  query SearchMovies(
    $query: String!
    $genre: String
    $year: Int
    $minRating: Float
    $language: String
  ) {
    searchMovies(
      query: $query
      genre: $genre
      year: $year
      minRating: $minRating
      language: $language
    ) {
      id
      title
      overview
      vote_average
      release_date
      genres {
        name
      }
    }
  }
`;