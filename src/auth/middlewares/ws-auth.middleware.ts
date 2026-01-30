import { JwtService } from '@nestjs/jwt';
import type {
  AuthenticatedSocket,
  AuthJwtPayload,
  SocketError,
} from '../types/auth-jwt-payload';

export const WSAuthMiddleware = (jwtService: JwtService) => {
  return (socket: AuthenticatedSocket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token as string;

    if (!token) {
      const err = new Error('Token is needed') as SocketError;
      err.data = { status: 401 };
      return next(err);
    }

    try {
      const payload: AuthJwtPayload = jwtService.verify(token);

      socket.handshake.user = { id: payload.sub };
      next();
    } catch {
      const err = new Error('Token is needed') as SocketError;
      err.data = { status: 401 };
      return next(err);
    }
  };
};
