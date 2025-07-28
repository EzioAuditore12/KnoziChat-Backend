import env from "@/env";

export interface sendSMSProps {
	recipient: string;
	message: string;
}

interface TextBeeApiResponses {
	data:
		| {
				success: true;
				message: string;
				smsBatchId: string;
				recipientCount: number;
		  }
		| {
				error: string;
		  };
}

export async function sendSMS({
	recipient,
	message,
}: sendSMSProps): Promise<boolean> {
	const response = (await fetch(
		`${env.TEXTBEE_BASE_URL}/gateway/devices/${env.TEXTBEE_DEVICE_ID}/send-sms`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": env.TEXTBEE_API_KEY,
			},
			body: JSON.stringify({
				recipients: [recipient],
				message,
			}),
		},
	).then((res) => res.json())) as TextBeeApiResponses;

	if ("success" in response.data && response.data.success === true) {
		return true;
	}
	return false;
}
