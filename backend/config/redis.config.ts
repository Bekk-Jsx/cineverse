import Redis from 'ioredis';
import config from 'config';

const redisConfig = config.get<{
  host: string;
  port: number;
}>('redis');

// Single Redis instance reused across the app
export const redis = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
  // Retry strategy — reconnect if connection drops
  retryStrategy: (times: number) => {
    if (times > 3) return null; // stop retrying after 3 attempts
    return times * 500;         // wait 500ms, 1000ms, 1500ms between retries
  },
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));