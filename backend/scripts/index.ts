import { setupElasticsearch } from '../services/indexing.service';
import { initDatabase } from '../config/init.config';

const main = async (): Promise<void> => {
  try {
    await initDatabase();
    await setupElasticsearch();
    console.log('🎉 Elasticsearch indexing complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Indexing failed:', error);
    process.exit(1);
  }
};

main();