import { createJobWorker } from "../lib/create-job-worker.js";
import { sendEmail } from "../providers/nodemailer.js";
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
export const addEmailJob = async (emailData) => {
    return emailQueue.add("send-email", emailData);
};
