export const register = async (): Promise<void> => {
  // Only runs on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDatabase } = await import('./backend/config/init.config');
    const { pingElasticsearch } = await import('./backend/config/elasticsearch.config');
    const { redis } = await import('./backend/config/redis.config');
    const { setCache, getCache, deleteCache } = await import('./backend/services/cache.service');

    await initDatabase();
    await pingElasticsearch();

    // Redis connects automatically — just import it
    redis.on('connect', () => console.log('✅ Redis ready'));

        // Test Redis cache
    await setCache('test:key', { message: 'Redis is working!' });
    const result = await getCache<{ message: string }>('test:key');
    console.log('✅ Redis cache test:', result?.message);
    await deleteCache('test:key');
  }
};