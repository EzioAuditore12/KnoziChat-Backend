export const defaultQueueConfig = {
    delay: 500,
    removeOnComplete: {
        count: 100,
        age: 20,
    },
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000,
    },
};
