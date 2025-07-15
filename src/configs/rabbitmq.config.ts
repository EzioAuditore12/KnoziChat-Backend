import ampq from "amqplib";

import env from "@/env";

let channel: ampq.Channel;

export const connectRabbitMQ = async () => {
	try {
		const connection = await ampq.connect({
			protocol: env.RABBIT_MQ_PROTOCOL,
			hostname: env.RABBIT_MQ_HOSTNAME,
			port: env.RABBIT_MQ_PORT,
			username: env.RABBIT_MQ_USERNAME,
			password: env.RABBIT_MQ_PASSWORD,
		});

		channel = await connection.createChannel();

		console.log("Connected to rabbit mq 😊");
	} catch (error) {
		console.log("Unable to connect to rabbit mq", error);
	}
};

export const publishToQueue = async (queueName: string, message: unknown) => {
	if (!channel) {
		console.log("Rabbit mq channel is not initialized");
		return;
	}
	await channel.assertQueue(queueName, { durable: true });

	channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
		persistent: true,
	});
};

export const getRabbitChannel = () => channel;
