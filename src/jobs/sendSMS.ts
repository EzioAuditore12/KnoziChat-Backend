import { createJobWorker } from "@/lib/create-job-worker";
import { sendSMS, type sendSMSProps } from "@/providers/textBeeSMS";

const { queue: smsQueue, worker: smsWorker } = createJobWorker({
	queueName: "sms-queue",
	jobProcessor: async (job) => {
		const { message, recipient } = job.data as sendSMSProps;

		const success = await sendSMS({ message, recipient });

		if (!success) {
			throw new Error("Failed to send email");
		}

		return { success: true, jobId: job.id };
	},
});

export { smsQueue, smsWorker };

export const addSMSJob = async (smsData: sendSMSProps) => {
	return smsQueue.add("send-sms", smsData);
};
