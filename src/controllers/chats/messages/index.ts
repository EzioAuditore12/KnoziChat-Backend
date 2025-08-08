import { getMessages } from "./get-messages";
import { sendAttachements } from "./send-attachements";
import { sendMessage } from "./send-message";

export const MessageRequestsHandler = {
	sendAttachements,
	sendMessage,
	getMessages,
};
