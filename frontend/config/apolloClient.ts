import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: '/api/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:3000/api/graphql-ws',
    on: {
      connecting: () => console.log('🔄 WebSocket connecting...'),
      connected: () => console.log('✅ WebSocket connected'),
      closed: () => console.log('❌ WebSocket closed'),
      error: (err) => console.error('❌ WebSocket error:', err),
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Movie: { keyFields: ['id'] },
    },
  }),
});