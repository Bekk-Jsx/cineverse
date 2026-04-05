import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { resolve } from 'path';
import couchdb from '../config/couchdb.config';
import type {
  MovieDocument,
  CreditDocument,
  PersonDocument,
  CastMember,
  CrewMember,
} from '../../frontend/types';

// ─── Config ────────────────────────────────────────────────────────────────

const DB_NAME = 'cineverse';
const BATCH_SIZE = 100; // CouchDB bulk insert batch size
const MOVIES_CSV = resolve(process.cwd(), 'data/tmdb_5000_movies.csv');
const CREDITS_CSV = resolve(process.cwd(), 'data/tmdb_5000_credits.csv');

// ─── Helpers ───────────────────────────────────────────────────────────────

// Safely parse JSON strings from CSV columns
const parseJSON = <T>(value: string): T[] => {
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
};

const now = () => new Date().toISOString();

// ─── CSV Parser ────────────────────────────────────────────────────────────

const parseCSV = <T>(filePath: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const records: T[] = [];

    createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row: T) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });

// ─── Bulk Insert ───────────────────────────────────────────────────────────

// CouchDB bulk_docs — insert in batches to avoid memory issues
const bulkInsert = async (db: ReturnType<typeof couchdb.db.use>, docs: object[]): Promise<void> => {
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await db.bulk({ docs: batch });
    console.log(`✅ Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} docs)`);
  }
};

// ─── Movie Import ──────────────────────────────────────────────────────────

const importMovies = async (db: ReturnType<typeof couchdb.db.use>): Promise<Map<number, string>> => {
  console.log('📥 Importing movies...');

  // Raw CSV row shape
  type RawMovie = {
    id: string;
    title: string;
    original_title: string;
    original_language: string;
    overview: string;
    tagline: string;
    status: string;
    homepage: string;
    budget: string;
    revenue: string;
    runtime: string;
    popularity: string;
    vote_average: string;
    vote_count: string;
    release_date: string;
    genres: string;
    keywords: string;
    production_companies: string;
    production_countries: string;
    spoken_languages: string;
  };

  const rows = await parseCSV<RawMovie>(MOVIES_CSV);

  // Map tmdb_id → _id for credits import
  const movieIdMap = new Map<number, string>();

  const docs: MovieDocument[] = rows.map((row) => {
    const tmdb_id = parseInt(row.id);
    const _id = `movie_${tmdb_id}`;
    movieIdMap.set(tmdb_id, _id);

    return {
      _id,
      type: 'movie',
      tmdb_id,
      title: row.title,
      original_title: row.original_title,
      original_language: row.original_language,
      overview: row.overview,
      tagline: row.tagline,
      status: row.status,
      homepage: row.homepage,
      budget: parseInt(row.budget) || 0,
      revenue: parseInt(row.revenue) || 0,
      runtime: parseFloat(row.runtime) || 0,
      popularity: parseFloat(row.popularity) || 0,
      vote_average: parseFloat(row.vote_average) || 0,
      vote_count: parseInt(row.vote_count) || 0,
      release_date: row.release_date,
      genres: parseJSON(row.genres),
      keywords: parseJSON(row.keywords),
      production_companies: parseJSON(row.production_companies),
      production_countries: parseJSON(row.production_countries),
      spoken_languages: parseJSON(row.spoken_languages),
      created_at: now(),
      updated_at: now(),
    };
  });

  await bulkInsert(db, docs);
  console.log(`✅ ${docs.length} movies imported`);

  return movieIdMap;
};

// ─── Credits Import ────────────────────────────────────────────────────────

const importCredits = async (
  db: ReturnType<typeof couchdb.db.use>,
  movieIdMap: Map<number, string>
): Promise<void> => {
  console.log('📥 Importing credits...');

  type RawCredit = {
    movie_id: string;
    title: string;
    cast: string;
    crew: string;
  };

  const rows = await parseCSV<RawCredit>(CREDITS_CSV);

  // Track unique persons across all movies
  const personMap = new Map<number, PersonDocument>();
  const creditDocs: CreditDocument[] = [];

  rows.forEach((row) => {
    const tmdb_movie_id = parseInt(row.movie_id);
    const movie_id = movieIdMap.get(tmdb_movie_id);

    if (!movie_id) return; // skip if movie not found

    const rawCast = parseJSON<{
      cast_id: number;
      credit_id: string;
      id: number;
      name: string;
      character: string;
      gender: number;
      order: number;
    }>(row.cast);

    const rawCrew = parseJSON<{
      credit_id: string;
      id: number;
      name: string;
      department: string;
      job: string;
      gender: number;
    }>(row.crew);

    // Build cast members
    const cast: CastMember[] = rawCast.map((c) => ({
      cast_id: c.cast_id,
      credit_id: c.credit_id,
      tmdb_id: c.id,
      name: c.name,
      character: c.character,
      gender: c.gender,
      order: c.order,
    }));

    // Build crew members
    const crew: CrewMember[] = rawCrew.map((c) => ({
      credit_id: c.credit_id,
      tmdb_id: c.id,
      name: c.name,
      department: c.department,
      job: c.job,
      gender: c.gender,
    }));

    // Credit document
    creditDocs.push({
      _id: `credit_${tmdb_movie_id}`,
      type: 'credit',
      movie_id,
      tmdb_movie_id,
      cast,
      crew,
      created_at: now(),
      updated_at: now(),
    });

    // Build unique person documents
    [...rawCast, ...rawCrew].forEach((p) => {
      if (!personMap.has(p.id)) {
        personMap.set(p.id, {
          _id: `person_${p.id}`,
          type: 'person',
          tmdb_id: p.id,
          name: p.name,
          gender: p.gender,
          known_for_department: 'department' in p ? p.department : 'Acting',
          movie_ids: [movie_id],
          created_at: now(),
          updated_at: now(),
        });
      } else {
        // Person exists — just add this movie to their list
        const person = personMap.get(p.id)!;
        if (!person.movie_ids.includes(movie_id)) {
          person.movie_ids.push(movie_id);
        }
      }
    });
  });

  await bulkInsert(db, creditDocs);
  console.log(`✅ ${creditDocs.length} credits imported`);

  await bulkInsert(db, Array.from(personMap.values()));
  console.log(`✅ ${personMap.size} persons imported`);
};

// ─── Main ──────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  try {
    // Make sure DB exists
    try {
      await couchdb.db.get(DB_NAME);
    } catch {
      await couchdb.db.create(DB_NAME);
    }

    const db = couchdb.db.use(DB_NAME);

    const movieIdMap = await importMovies(db);
    await importCredits(db, movieIdMap);

    console.log('🎉 Import complete!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
};

main();