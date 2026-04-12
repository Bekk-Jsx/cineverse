import { gql } from 'graphql-tag';

export const notificationTypeDefs = gql`
  type ReviewNotification {
    movie_id:   String!
    username:   String!
    rating:     Int!
    content:    String!
    created_at: String!
  }

  type Subscription {
    newReview(movieId: String!): ReviewNotification!
  }
`;