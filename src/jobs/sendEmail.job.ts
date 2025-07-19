import { defaultQueueConfig } from "@/configs/bullMq.config";
import { redisClient } from "@/configs/redis.client";
import { Queue, Worker } from "bullmq";

export const emailQueueName = "email-queue";

export const emailQueue = new Queue(emailQueueName, {
	connection: redisClient,
	defaultJobOptions: defaultQueueConfig,
});

export const handler = new Worker(
	emailQueueName,
	async (job) => {
		console.log("Email worker data is", job.data);
	},
	{ connection: redisClient },
);

handler.on("completed", (job) => {
	console.log(`The job is ${job.id} is completed`);
});

handler.on("failed", (job) => {
	console.log(`The job is ${job?.id} is completed`);
});
