import env from "@/env";
import { createTransport } from "nodemailer";

const tranporter = createTransport({
	host: env.NODEMAILER_SMTP_HOST,
	port: env.NODEMAILER_SMTP_PORT,
	secure: env.NODEMAILER_SMTP_PORT === 465,
	auth: {
		user: env.NODEMAILER_SMTP_USER,
		pass: env.NODEMAILER_SMTP_PASS,
	},
});

export interface SendEmailProps {
	toMail: string;
	subject: string;
	body: string;
}

export const sendEmail = async ({ toMail, subject, body }: SendEmailProps) => {
	try {
		const info = await tranporter.sendMail({
			from: env.NODEMAILER_FROM_EMAIL,
			to: toMail,
			subject: subject,
			html: body,
		});
		console.log(info);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};
