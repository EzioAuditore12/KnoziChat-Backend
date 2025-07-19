import env from "@/env";
import { createTransport } from "nodemailer";

const tranporter = createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_PORT === 465,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
});

interface SendEmailProps {
	toMail: string;
	subject: string;
	body: string;
}

export const sendEmail = async ({ toMail, subject, body }: SendEmailProps) => {
	try {
		const info = await tranporter.sendMail({
			from: env.FROM_EMAIL,
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
