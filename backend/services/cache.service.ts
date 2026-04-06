import { redis } from '../config/redis.config';
import config from 'config';

const ttlConfig = config.get<{
  session: number;
  cache: number;
  rateLimit: number;
}>('redis.ttl');

// ─── Generic Cache ─────────────────────────────────────────────────────────

// Store any value as JSON with TTL
export const setCache = async (
  key: string,
  value: unknown,
  ttl: number = ttlConfig.cache
): Promise<void> => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

// Retrieve and parse cached value
export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
};

// Delete a cache key
export const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};

// Delete multiple keys by pattern
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// ─── Session Cache ─────────────────────────────────────────────────────────

export const setSession = async (
  userId: string,
  data: unknown
): Promise<void> => {
  await redis.set(
    `session:${userId}`,
    JSON.stringify(data),
    'EX',
    ttlConfig.session  // 24 hours
  );
};

export const getSession = async <T>(userId: string): Promise<T | null> => {
  const data = await redis.get(`session:${userId}`);
  if (!data) return null;
  return JSON.parse(data) as T;
};

export const deleteSession = async (userId: string): Promise<void> => {
  await redis.del(`session:${userId}`);
};

// ─── Rate Limiting ─────────────────────────────────────────────────────────

// Returns current request count for an IP
export const rateLimit = async (
  ip: string,
  limit: number = 100
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> => {
  const key = `ratelimit:${ip}`;
  
  // Increment counter — creates key if doesn't exist
  const count = await redis.incr(key);

  if (count === 1) {
    // First request — set TTL
    await redis.expire(key, ttlConfig.rateLimit);
  }

  const resetIn = await redis.ttl(key);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetIn,
  };
};

// ─── Movie Cache ───────────────────────────────────────────────────────────

// Cache keys convention — consistent naming across the app
export const CACHE_KEYS = {
  movie: (id: string) => `movie:${id}`,
  movies: (page: number) => `movies:page:${page}`,
  trending: () => 'movies:trending',
  search: (query: string) => `search:${query}`,
  person: (id: string) => `person:${id}`,
};