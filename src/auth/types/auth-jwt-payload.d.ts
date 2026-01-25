import type { FastifyRequest } from 'fastify';
import { Socket } from 'socket.io';

export type AuthJwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export interface AuthRequest extends FastifyRequest {
  user: { id: string };
}

export interface RefreshTokenStratergyReqParameters {
  user: { id: string; refreshToken: string; issuedAt: Date; expiredAt: Date };
}

export type SocketError = Error & { data: { status: number } };

export interface AuthenticatedSocket extends Socket {
  handshake: Socket['handshake'] & {
    user: {
      id: string;
    };
  };
}
