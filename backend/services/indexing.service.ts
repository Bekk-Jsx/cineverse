import { esClient } from '../config/elasticsearch.config';
import { db } from '../config/couchdb.config';
import type { MovieDocument, PersonDocument } from '../../frontend/types';

// ─── Index Mappings ────────────────────────────────────────────────────────

const MOVIES_INDEX = 'movies';
const PERSONS_INDEX = 'persons';

// ─── Create Indexes ────────────────────────────────────────────────────────

export const createMoviesIndex = async (): Promise<void> => {
  const exists = await esClient.indices.exists({ index: MOVIES_INDEX });
  if (exists) {
    console.log('✅ Movies index already exists');
    return;
  }

  await esClient.indices.create({
    index: MOVIES_INDEX,
    mappings: {
      properties: {
        tmdb_id:           { type: 'integer' },
        title:             { type: 'text', analyzer: 'english' },  // full-text
        original_title:    { type: 'text', analyzer: 'english' },
        overview:          { type: 'text', analyzer: 'english' },
        tagline:           { type: 'text' },
        status:            { type: 'keyword' },                    // exact match
        original_language: { type: 'keyword' },
        budget:            { type: 'long' },
        revenue:           { type: 'long' },
        runtime:           { type: 'float' },
        popularity:        { type: 'float' },
        vote_average:      { type: 'float' },
        vote_count:        { type: 'integer' },
        release_date:      { type: 'date' },
        genres: {
          type: 'nested',                                          // array of objects
          properties: {
            id:   { type: 'integer' },
            name: { type: 'keyword' },
          },
        },
        keywords: {
          type: 'nested',
          properties: {
            id:   { type: 'integer' },
            name: { type: 'keyword' },
          },
        },
      },
    },
  });

  console.log('✅ Movies index created');
};

export const createPersonsIndex = async (): Promise<void> => {
  const exists = await esClient.indices.exists({ index: PERSONS_INDEX });
  if (exists) {
    console.log('✅ Persons index already exists');
    return;
  }

  await esClient.indices.create({
    index: PERSONS_INDEX,
    mappings: {
      properties: {
        tmdb_id:               { type: 'integer' },
        name:                  { type: 'text', analyzer: 'english' },
        gender:                { type: 'integer' },
        known_for_department:  { type: 'keyword' },
        movie_ids:             { type: 'keyword' },
      },
    },
  });

  console.log('✅ Persons index created');
};

// ─── Index Documents ───────────────────────────────────────────────────────

export const indexMovies = async (): Promise<void> => {
  console.log('📥 Indexing movies into Elasticsearch...');

  // Fetch all movies from CouchDB using Mango query
  const result = await db.find({
    selector: { type: 'movie' },
    limit: 10000,
  });

  const movies = result.docs as MovieDocument[];

  // Bulk index into ES
  const operations = movies.flatMap((movie) => [
    { index: { _index: MOVIES_INDEX, _id: movie._id } },
    {
      tmdb_id:           movie.tmdb_id,
      title:             movie.title,
      original_title:    movie.original_title,
      overview:          movie.overview,
      tagline:           movie.tagline,
      status:            movie.status,
      original_language: movie.original_language,
      budget:            movie.budget,
      revenue:           movie.revenue,
      runtime:           movie.runtime,
      popularity:        movie.popularity,
      vote_average:      movie.vote_average,
      vote_count:        movie.vote_count,
      release_date:      movie.release_date || null,
      genres:            movie.genres,
      keywords:          movie.keywords,
    },
  ]);

  const response = await esClient.bulk({ operations });

  if (response.errors) {
    console.error('❌ Some documents failed to index');
  } else {
    console.log(`✅ ${movies.length} movies indexed`);
  }
};

export const indexPersons = async (): Promise<void> => {
  console.log('📥 Indexing persons into Elasticsearch...');

  const result = await db.find({
    selector: { type: 'person' },
    limit: 100000,
  });

  const persons = result.docs as PersonDocument[];

  const operations = persons.flatMap((person) => [
    { index: { _index: PERSONS_INDEX, _id: person._id } },
    {
      tmdb_id:              person.tmdb_id,
      name:                 person.name,
      gender:               person.gender,
      known_for_department: person.known_for_department,
      movie_ids:            person.movie_ids,
    },
  ]);

  const response = await esClient.bulk({ operations });

  if (response.errors) {
    console.error('❌ Some documents failed to index');
  } else {
    console.log(`✅ ${persons.length} persons indexed`);
  }
};

// ─── Setup All ─────────────────────────────────────────────────────────────

export const setupElasticsearch = async (): Promise<void> => {
  await createMoviesIndex();
  await createPersonsIndex();
  await indexMovies();
  await indexPersons();
};