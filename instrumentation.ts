export const register = async (): Promise<void> => {
  // Only runs on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDatabase } = await import('./backend/config/init.config');
    const { pingElasticsearch } = await import('./backend/config/elasticsearch.config');
    const { redis } = await import('./backend/config/redis.config');
    const { startChangesFeed } = await import('./backend/services/changes.service');

    await initDatabase();
    await pingElasticsearch();

    // Redis connects automatically — just import it
    redis.on('connect', () => console.log('✅ Redis ready'));
    
    // Start listening to CouchDB changes
    startChangesFeed();
  }
};