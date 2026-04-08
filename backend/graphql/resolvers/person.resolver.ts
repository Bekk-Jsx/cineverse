import { db } from '../../config/couchdb.config';
import type { PersonDocument, CreditDocument } from '../../../frontend/types';

export const personResolvers = {
  Query: {
    person: async (_: unknown, { id }: { id: string }) => {
      try {
        const person = await db.get(`person_${id}`) as PersonDocument;
        return {
          id: person._id.replace('person_', ''),
          ...person,
        };
      } catch {
        return null;
      }
    },

    movieCredits: async (_: unknown, { movieId }: { movieId: string }) => {
      try {
        const credit = await db.get(`credit_${movieId}`) as CreditDocument;
        return credit;
      } catch {
        return null;
      }
    },
  },
};