import app from "./app";
import { connectRabbitMQ } from "./configs/rabbitmq.config";
import { RedisClient } from "./configs/redis.client";
import env from "./env";
import { SendOtpConsumer } from "./services/mail";

/*
const startServer = async () => {
	// Connect to RabbitMQ first
	await connectRabbitMQ();

	// Start the OTP consumer after RabbitMQ is connected
	await SendOtpConsumer();

	// Start the server
	const server = Bun.serve({
		port: env.PORT,
		fetch: app.fetch,
	});

	console.log("Server running", server.port);
};

// Initialize Redis (this can happen async)
RedisClient();

// Start everything
startServer().catch(console.error);
*/

const server = Bun.serve({
	port: env.PORT,
	fetch: app.fetch,
});

console.log("Server running", server.port);
