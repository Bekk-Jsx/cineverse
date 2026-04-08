import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: '/api/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Movie: {
        // Use id field as cache key
        keyFields: ['id'],
      },
    },
  }),
});