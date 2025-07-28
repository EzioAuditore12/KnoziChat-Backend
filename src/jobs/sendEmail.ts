import { createJobWorker } from "@/lib/create-job-worker";
import { type SendEmailProps, sendEmail } from "@/providers/nodemailer";

const { queue: emailQueue, worker: emailWorker } = createJobWorker({
	queueName: "email-queue",
	jobProcessor: async (job) => {
		const { toMail, subject, body } = job.data;
		const success = await sendEmail({ toMail, subject, body });

		if (!success) {
			throw new Error("Failed to send email");
		}

		return { success: true, jobId: job.id };
	},
});

export { emailQueue, emailWorker };

export const addEmailJob = async (emailData: SendEmailProps) => {
	return emailQueue.add("send-email", emailData);
};
