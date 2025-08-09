import { createJobWorker } from "../lib/create-job-worker.js";
import { sendSMS } from "../providers/textBeeSMS.js";
const { queue: smsQueue, worker: smsWorker } = createJobWorker({
    queueName: "sms-queue",
    jobProcessor: async (job) => {
        const { message, recipient } = job.data;
        const success = await sendSMS({ message, recipient });
        if (!success) {
            throw new Error("Failed to send email");
        }
        return { success: true, jobId: job.id };
    },
});
export { smsQueue, smsWorker };
export const addSMSJob = async (smsData) => {
    return smsQueue.add("send-sms", smsData);
};
