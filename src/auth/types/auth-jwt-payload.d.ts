import type { FastifyRequest } from 'fastify';

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
