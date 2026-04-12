import { pubsub, SUBSCRIPTION_EVENTS } from '../pubsub';
import { withFilter } from 'graphql-subscriptions';

export const notificationResolvers = {
    Subscription: {
        newReview: {
            subscribe: withFilter(
                () => {
                    console.log('🔔 Client subscribed to newReview'); // ← add this
                    return pubsub.asyncIterableIterator(SUBSCRIPTION_EVENTS.NEW_REVIEW)
                },
                (
                    payload: { movie_id: string } | undefined,
                    variables: { movieId: string } | undefined
                ) => {
                    if (!payload || !variables) return false;
                    return payload.movie_id === `movie_${variables.movieId}`;
                }
            ),
            resolve: (payload: unknown) => payload,
        },
    },
};