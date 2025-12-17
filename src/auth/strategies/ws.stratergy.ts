import { Socket } from 'socket.io';
import { WsJwtGuard } from '../guards/ws-jwt.guard';

type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const socketAuthStratergy = (): SocketIOMiddleware => {
  return (client, next) => {
    try {
      WsJwtGuard.validateToken(client);
      next();
    } catch (error) {
      next(error);
    }
  };
};
