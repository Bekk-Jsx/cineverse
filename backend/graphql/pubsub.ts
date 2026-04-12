import { PubSub } from 'graphql-subscriptions';
import { subscriber, CHANNELS } from '../services/pubsub.service';

// GraphQL PubSub instance — bridges Redis with GraphQL subscriptions
export const pubsub = new PubSub();

// GraphQL subscription event names
export const SUBSCRIPTION_EVENTS = {
    NEW_REVIEW: 'NEW_REVIEW',
    DELETE_REVIEW: 'DELETE_REVIEW',
    NEW_USER: 'NEW_USER',
};

// Bridge Redis messages → GraphQL PubSub
const bridgeChannel = (redisChannel: string, gqlEvent: string): void => {
    subscriber.subscribe(redisChannel);
    subscriber.on('message', (channel, message) => {
        if (channel === redisChannel) {
            pubsub.publish(gqlEvent, JSON.parse(message));
        }
    });
};

// Start bridging all channels
export const initPubSubBridge = (): void => {
    bridgeChannel(CHANNELS.NEW_REVIEW, SUBSCRIPTION_EVENTS.NEW_REVIEW);
    bridgeChannel(CHANNELS.DELETE_REVIEW, SUBSCRIPTION_EVENTS.DELETE_REVIEW);
    bridgeChannel(CHANNELS.NEW_USER, SUBSCRIPTION_EVENTS.NEW_USER);
    console.log('✅ Redis → GraphQL PubSub bridge initialized');
};