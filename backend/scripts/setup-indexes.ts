import { db } from '../config/couchdb.config';

const createIndexes = async (): Promise<void> => {
  // Index for type + vote_average (for sorted movie listing)
  await db.createIndex({
    index: {
      fields: ['type', 'vote_average'],
    },
    name: 'type-vote-index',
  });

  // Index for type + email (for user lookup)
  await db.createIndex({
    index: {
      fields: ['type', 'email'],
    },
    name: 'type-email-index',
  });

  // Index for type only (for general queries)
  await db.createIndex({
    index: {
      fields: ['type'],
    },
    name: 'type-index',
  });

  // Index for reviews by movie
  await db.createIndex({
    index: {
      fields: ['type', 'movie_id', 'created_at'],
    },
    name: 'type-movie-review-index',
  });

  // Index for user reviews
  await db.createIndex({
    index: {
      fields: ['type', 'user_id', 'movie_id'],
    },
    name: 'type-user-movie-index',
  });

  console.log('✅ CouchDB indexes created');
};

createIndexes().catch(console.error);