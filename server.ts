import { createServer } from 'http';
import next from 'next';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs, resolvers } from './backend/graphql';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    const { initDatabase } = await import('./backend/config/init.config');
    const { pingElasticsearch } = await import('./backend/config/elasticsearch.config');
    const { redis } = await import('./backend/config/redis.config');
    const { startChangesFeed } = await import('./backend/services/changes.service');
    const { initPubSubBridge } = await import('./backend/graphql/pubsub');

    await initDatabase();
    await pingElasticsearch();
    redis.on('connect', () => console.log('✅ Redis ready'));
    startChangesFeed();
    initPubSubBridge();

    const httpServer = createServer((req, res) => {
        handle(req, res);
    });

    const wss = new WebSocketServer({ noServer: true });

    try {
        const schema = makeExecutableSchema({ typeDefs, resolvers });
        console.log('✅ GraphQL schema built');

        useServer(
            {
                schema,
                onConnect: () => console.log('🔌 GraphQL WS client connected'),
                onDisconnect: () => console.log('🔌 GraphQL WS client disconnected'),
                onError: (ctx, msg, errors) => console.error('❌ GraphQL WS error:', errors),
            },
            wss
        );
    } catch (err) {
        console.error('❌ Schema build failed:', err);
    }

    httpServer.on('upgrade', (req, socket, head) => {
        const { pathname } = new URL(req.url!, `http://${req.headers.host}`);

        if (pathname === '/api/graphql-ws') {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req);
            });
        } else {
            app.getUpgradeHandler()(req, socket, head);
        }
    });

    httpServer.listen(3000, () => {
        console.log('✅ HTTP server on http://localhost:3000');
        console.log('✅ WebSocket server on ws://localhost:3000/api/graphql-ws');
    });
});