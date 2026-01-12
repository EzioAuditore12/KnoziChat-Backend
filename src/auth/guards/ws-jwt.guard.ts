import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { AuthJwtPayload } from '../types/auth-jwt-payload';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') return true;

    const client: Socket = context.switchToWs().getClient();

    WsJwtGuard.validateToken(client);

    return false;
  }

  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;

    if (!authorization)
      throw new UnauthorizedException('Authroization Header is required');

    if (
      !authorization.startsWith('Bearer') &&
      authorization.split(' ').length !== 2
    )
      throw new UnauthorizedException(
        'Authroization Header must start with bearer and should be of length 2',
      );

    const token = authorization.slice(7).trim();

    if (!token)
      throw new UnauthorizedException(
        'Token not found in authroization header',
      );

    const jwtService = new JwtService();

    const payload: AuthJwtPayload = jwtService.verify(token, {
      secret: process.env.JWT_SECRET!,
    });

    return payload;
  }
}
