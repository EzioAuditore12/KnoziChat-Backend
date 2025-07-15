import { getRabbitChannel } from "@/configs/rabbitmq.config";
import env from "@/env";
import nodemailer from "nodemailer";

export const SendOtpConsumer = async () => {
	const channel = getRabbitChannel();
	if (!channel) {
		console.log("RabbitMQ channel is not initialized");
		return;
	}

	const queueName = "send-otp";
	await channel.assertQueue(queueName, { durable: true });

	console.log("✅ Mail Service consumer started, listening for otp emails");

	channel.consume(queueName, async (msg) => {
		if (msg) {
			try {
				const { to, subject, body } = JSON.parse(msg.content.toString());

				const transporter = nodemailer.createTransport({
					host: "smtp.gmail.com",
					port: 587,
					secure: false, // true for 465, false for other ports
					auth: {
						user: env.NODEMAILER_USERNAME,
						pass: env.NODEMAILER_PASSWORD,
					},
				});

				await transporter.sendMail({
					from: "KnoziChat app",
					to,
					subject,
					text: body,
				});

				console.log(`OTP mail sent to ${to}`);
				channel.ack(msg);
			} catch (error) {
				console.log("Failed to send otp", error);
			}
		}
	});
};
