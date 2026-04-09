import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redis — we don't want real Redis in tests
vi.mock('../../config/redis.config', () => ({
  redis: {
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn(),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue([]),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(60),
  },
}));

vi.mock('config', () => ({
  default: {
    get: vi.fn().mockReturnValue({
      session: 86400,
      cache: 300,
      rateLimit: 60,
    }),
  },
}));

import { setCache, getCache, deleteCache, rateLimit } from '../cache.service';
import { redis } from '../../config/redis.config';

describe('Cache Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setCache', () => {
    it('should store value as JSON with TTL', async () => {
      const key = 'test:key';
      const value = { title: 'Avatar' };

      await setCache(key, value);

      expect(redis.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        'EX',
        300
      );
    });

    it('should use custom TTL when provided', async () => {
      await setCache('test:key', { data: 'test' }, 600);

      expect(redis.set).toHaveBeenCalledWith(
        'test:key',
        JSON.stringify({ data: 'test' }),
        'EX',
        600
      );
    });
  });

  describe('getCache', () => {
    it('should return parsed value when cache hit', async () => {
      const mockData = { title: 'Avatar', vote_average: 7.2 };
      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockData));

      const result = await getCache<typeof mockData>('test:key');

      expect(result).toEqual(mockData);
    });

    it('should return null when cache miss', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);

      const result = await getCache('test:key');

      expect(result).toBeNull();
    });
  });

  describe('deleteCache', () => {
    it('should delete key from redis', async () => {
      await deleteCache('test:key');

      expect(redis.del).toHaveBeenCalledWith('test:key');
    });
  });

  describe('rateLimit', () => {
    it('should allow request when under limit', async () => {
      vi.mocked(redis.incr).mockResolvedValue(1);
      vi.mocked(redis.ttl).mockResolvedValue(60);

      const result = await rateLimit('192.168.1.1', 100);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should block request when over limit', async () => {
      vi.mocked(redis.incr).mockResolvedValue(101);
      vi.mocked(redis.ttl).mockResolvedValue(30);

      const result = await rateLimit('192.168.1.1', 100);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should set TTL only on first request', async () => {
      vi.mocked(redis.incr).mockResolvedValue(1);

      await rateLimit('192.168.1.1', 100);

      expect(redis.expire).toHaveBeenCalledWith('ratelimit:192.168.1.1', 60);
    });

    it('should NOT set TTL on subsequent requests', async () => {
      vi.mocked(redis.incr).mockResolvedValue(2);

      await rateLimit('192.168.1.1', 100);

      expect(redis.expire).not.toHaveBeenCalled();
    });
  });
});