import { ApolloServer } from '@apollo/server';
import { movieTypeDefs } from './schema/movie.schema';
import { personTypeDefs } from './schema/person.schema';
import { movieResolvers } from './resolvers/movie.resolver';
import { personResolvers } from './resolvers/person.resolver';
// import { mergeResolvers } from '@graphql-tools/merge';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mergeResolvers } = require('@graphql-tools/merge');

// Merge all schemas and resolvers
export const typeDefs = [movieTypeDefs, personTypeDefs];
export const resolvers = mergeResolvers([movieResolvers, personResolvers]);

// Single Apollo Server instance
export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});