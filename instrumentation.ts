export const register = async (): Promise<void> => {
  // Only runs on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDatabase } = await import('./backend/config/init.config');
    const { pingElasticsearch } = await import('./backend/config/elasticsearch.config');

    await initDatabase();
    await pingElasticsearch();
  }
};