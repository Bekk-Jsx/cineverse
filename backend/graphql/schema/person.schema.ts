import { gql } from 'graphql-tag';

export const personTypeDefs = gql`
  type CastMember {
    tmdb_id: Int!
    name: String!
    character: String!
    order: Int!
    gender: Int!
  }

  type CrewMember {
    tmdb_id: Int!
    name: String!
    department: String!
    job: String!
  }

  type Credit {
    movie_id: String!
    cast: [CastMember!]!
    crew: [CrewMember!]!
  }

  type Person {
    id: ID!
    tmdb_id: Int!
    name: String!
    gender: Int!
    known_for_department: String!
    movie_ids: [String!]!
  }

  extend type Query {
    person(id: ID!): Person
    movieCredits(movieId: ID!): Credit
  }
`;