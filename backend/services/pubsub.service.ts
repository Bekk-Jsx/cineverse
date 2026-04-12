import Redis from 'ioredis';
import config from 'config';

const redisConfig = config.get<{ host: string; port: number }>('redis');

// Need TWO separate Redis connections for pub/sub
// One connection cannot both publish and subscribe
export const publisher = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
});

export const subscriber = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
});

// Channel names
export const CHANNELS = {
    NEW_REVIEW: 'channel:new_review',
    DELETE_REVIEW: 'channel:delete_review',
    NEW_USER: 'channel:new_user',
};

// Publish a message to a channel
export const publish = async (
    channel: string,
    data: unknown
): Promise<void> => {
    await publisher.publish(channel, JSON.stringify(data));
};

// Subscribe to a channel
export const subscribe = (
    channel: string,
    callback: (data: unknown) => void
): void => {
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, message) => {
        if (ch === channel) {
            callback(JSON.parse(message));
        }
    });
};