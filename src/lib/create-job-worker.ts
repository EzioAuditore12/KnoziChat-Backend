import { defaultQueueConfig } from "@/configs/bullMq.config";
import { type DefaultJobOptions, type Processor, Queue, Worker } from "bullmq";
import { redisClient } from "./redis-client";

interface CreateJobWokerProps {
	queueName: string;
	queueConfig?: DefaultJobOptions;
	jobProcessor: Processor;
}

export function createJobWorker({
	queueName,
	queueConfig = defaultQueueConfig,
	jobProcessor,
}: CreateJobWokerProps) {
	const queue = new Queue(queueName, {
		connection: redisClient,
		defaultJobOptions: queueConfig,
	});

	const worker = new Worker(queueName, jobProcessor, {
		connection: redisClient,
	});

	worker.on("completed", (job) => {
		console.log(`The job is ${job.id} is completed`);
	});

	worker.on("failed", (job) => {
		console.log(`The job is ${job?.id} is completed`);
	});

	return {
		queue,
		worker,
	};
}
