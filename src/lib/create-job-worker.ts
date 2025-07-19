import { redisClient } from "@/configs/redis.client";
import { Worker } from "bullmq";

interface CreateJobWorkerProps {
	queueName: string;
}

export function createJobWorker() {}
