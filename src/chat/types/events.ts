import { DirectMessageDto } from '../dto/direct-message.dto';

export interface ServerToClientEvents {
  newMessage: (payload: DirectMessageDto) => void;
}
