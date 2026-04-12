import { ApolloServer } from '@apollo/server';
import { movieTypeDefs } from './schema/movie.schema';
import { personTypeDefs } from './schema/person.schema';
import { movieResolvers } from './resolvers/movie.resolver';
import { personResolvers } from './resolvers/person.resolver';
import { notificationResolvers } from './resolvers/notification.resolver';
import { notificationTypeDefs } from './schema/notification.schema';

export const resolvers = {
  Query: {
    ...movieResolvers.Query,
    ...personResolvers.Query,
  },
  Mutation: {
    ...movieResolvers.Mutation,
  },
  Subscription: {
    ...notificationResolvers.Subscription,
  },
};

// Merge all schemas and resolvers
export const typeDefs = [movieTypeDefs, personTypeDefs, notificationTypeDefs];

// Single Apollo Server instance
export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});