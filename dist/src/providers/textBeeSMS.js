import env from "../env.js";
export async function sendSMS({ recipient, message, }) {
    const response = (await fetch(`${env.TEXTBEE_BASE_URL}/gateway/devices/${env.TEXTBEE_DEVICE_ID}/send-sms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": env.TEXTBEE_API_KEY,
        },
        body: JSON.stringify({
            recipients: [recipient],
            message,
        }),
    }).then((res) => res.json()));
    if ("success" in response.data && response.data.success === true) {
        return true;
    }
    return false;
}
