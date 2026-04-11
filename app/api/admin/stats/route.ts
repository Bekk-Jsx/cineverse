import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from '@/backend/middlewares/auth.middleware';
import { db } from '@/backend/config/couchdb.config';
import { esClient } from '@/backend/config/elasticsearch.config';
import { redis } from '@/backend/config/redis.config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (_req: NextRequest) => {
    // Get counts from CouchDB
    const [moviesResult, personsResult, usersResult] = await Promise.all([
        db.find({ selector: { type: 'movie' }, fields: ['_id'], limit: 999999 }),
        db.find({ selector: { type: 'person' }, fields: ['_id'], limit: 999999 }),
        db.find({ selector: { type: 'user' }, fields: ['_id'], limit: 999999 }),
    ]);

    // Get ES index stats
    const esStats = await esClient.indices.stats({ index: ['movies', 'persons'] });

    // Get Redis info
    const redisInfo = await redis.info('memory');
    const memoryMatch = redisInfo.match(/used_memory_human:(\S+)/);
    const redisMemory = memoryMatch ? memoryMatch[1] : 'N/A';

    return NextResponse.json({
        data: {
            counts: {
                movies: moviesResult.docs.length,
                persons: personsResult.docs.length,
                users: usersResult.docs.length,
            },
            elasticsearch: {
                movies_indexed: esStats.indices?.movies?.total?.docs?.count ?? 0,
                persons_indexed: esStats.indices?.persons?.total?.docs?.count ?? 0,
            },
            redis: {
                memory: redisMemory,
            },
        },
    });
}, ['admin']);