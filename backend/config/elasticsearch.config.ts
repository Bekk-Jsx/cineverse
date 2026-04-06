import { Client } from '@elastic/elasticsearch';
import config from 'config';

const esConfig = config.get<{
  host: string;
  port: number;
}>('elasticsearch');

// Single ES client instance
export const esClient = new Client({
  node: `http://${esConfig.host}:${esConfig.port}`,
});

// Verify connection
export const pingElasticsearch = async (): Promise<void> => {
  const isAlive = await esClient.ping();
  if (isAlive) {
    console.log('✅ Elasticsearch connected');
  } else {
    throw new Error('❌ Elasticsearch connection failed');
  }
};