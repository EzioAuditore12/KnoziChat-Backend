import type { DefaultJobOptions } from "bullmq";

export const defaultQueueConfig: DefaultJobOptions = {
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
