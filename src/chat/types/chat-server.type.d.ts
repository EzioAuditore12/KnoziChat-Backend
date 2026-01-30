import { SendMessageDto } from '../dto/message/send-message.dto';

export interface ChatServerEvents {
  'message:receive': (message: SendMessageDto) => void;
  'online:users': (users: string) => void;
}
