import config from 'config';
import couchdb from './couchdb.config';

const dbName = config.get<string>('couchdb.database');

export const initDatabase = async (): Promise<void> => {
  try {
    await couchdb.db.get(dbName);
    console.log(`✅ Database "${dbName}" already exists`);
  } catch (error) {
    // NanoError has a statusCode property
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 404) {
      await couchdb.db.create(dbName);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      throw error;
    }
  }
};