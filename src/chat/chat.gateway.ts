import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ServerToClientEvents } from './types/events';
import { DirectMessageDto } from './dto/direct-message.dto';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { socketAuthStratergy } from 'src/auth/strategies/ws.stratergy';

@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  afterInit(client: Server) {
    client.use(socketAuthStratergy())
    Logger.log('afterInit')
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello';
  }

  handleConnection(client: Socket) {
    client.handshake.headers.authorization
  }

  sendMessage(message: DirectMessageDto) {
    // socket.emit('newMessage', 'hello world from the server')
    this.server.emit('newMessage', message);
  }
}
