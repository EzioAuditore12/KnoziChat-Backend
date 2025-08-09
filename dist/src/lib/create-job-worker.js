import { defaultQueueConfig } from "../configs/bullMq.config.js";
import { Queue, Worker } from "bullmq";
import { redisClient } from "./redis-client.js";
export function createJobWorker({ queueName, queueConfig = defaultQueueConfig, jobProcessor, }) {
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
