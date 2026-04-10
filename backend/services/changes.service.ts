import config from 'config';
import { esClient } from '../config/elasticsearch.config';
import type { MovieDocument, PersonDocument } from '../../frontend/types';

const couchdbConfig = config.get<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>('couchdb');

const baseUrl = `http://${couchdbConfig.username}:${couchdbConfig.password}@${couchdbConfig.host}:${couchdbConfig.port}`;
const dbUrl = `${baseUrl}/${couchdbConfig.database}`;

// ─── Handle Changes ────────────────────────────────────────────────────────

const handleMovieChange = async (doc: MovieDocument): Promise<void> => {
  await esClient.index({
    index: 'movies',
    id: doc._id,
    document: {
      tmdb_id:           doc.tmdb_id,
      title:             doc.title,
      original_title:    doc.original_title,
      overview:          doc.overview,
      tagline:           doc.tagline,
      status:            doc.status,
      original_language: doc.original_language,
      budget:            doc.budget,
      revenue:           doc.revenue,
      runtime:           doc.runtime,
      popularity:        doc.popularity,
      vote_average:      doc.vote_average,
      vote_count:        doc.vote_count,
      release_date:      doc.release_date || null,
      genres:            doc.genres,
      keywords:          doc.keywords,
    },
  });
  console.log(`✅ ES updated for movie: ${doc.title}`);
};

const handlePersonChange = async (doc: PersonDocument): Promise<void> => {
  await esClient.index({
    index: 'persons',
    id: doc._id,
    document: {
      tmdb_id:              doc.tmdb_id,
      name:                 doc.name,
      gender:               doc.gender,
      known_for_department: doc.known_for_department,
      movie_ids:            doc.movie_ids,
    },
  });
  console.log(`✅ ES updated for person: ${doc.name}`);
};

const handleDelete = async (id: string): Promise<void> => {
  const index = id.startsWith('movie_') ? 'movies' :
                id.startsWith('person_') ? 'persons' : null;

  if (!index) return;

  try {
    await esClient.delete({ index, id });
    console.log(`✅ ES deleted: ${id}`);
  } catch {
    // Document might not exist in ES
  }
};

// ─── Changes Feed via long-polling ─────────────────────────────────────────

const pollChanges = async (since: string = 'now'): Promise<void> => {
  try {
    const credentials = Buffer.from(
      `${couchdbConfig.username}:${couchdbConfig.password}`
    ).toString('base64');

    const url = `http://${couchdbConfig.host}:${couchdbConfig.port}/${couchdbConfig.database}/_changes?feed=longpoll&since=${since}&include_docs=true&heartbeat=10000&timeout=30000`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json() as {
      last_seq: string;
      results: {
        id: string;
        seq: string;
        deleted?: boolean;
        doc?: MovieDocument | PersonDocument;
      }[];
    };

    for (const change of data.results) {
      if (change.deleted) {
        await handleDelete(change.id);
        continue;
      }

      const doc = change.doc;
      if (!doc?.type) continue;

      switch (doc.type) {
        case 'movie':
          await handleMovieChange(doc as MovieDocument);
          break;
        case 'person':
          await handlePersonChange(doc as PersonDocument);
          break;
        default:
          break;
      }
    }

    await pollChanges(data.last_seq);

  } catch (error) {
    console.error('❌ Changes feed error:', error);
    setTimeout(() => pollChanges(since), 5000);
  }
};

// ─── Start Changes Feed ────────────────────────────────────────────────────

export const startChangesFeed = (): void => {
  console.log('👂 Listening to CouchDB changes feed...');
  pollChanges('now').catch(console.error);
};