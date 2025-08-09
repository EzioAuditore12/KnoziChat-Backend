import { getMessages } from "./get-messages.js";
import { sendAttachements } from "./send-attachements.js";
import { sendMessage } from "./send-message.js";
export const MessageRequestsHandler = {
    sendAttachements,
    sendMessage,
    getMessages,
};
