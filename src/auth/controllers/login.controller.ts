import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserAuthService } from '../services/user-auth.service';
import { TokenService } from '../services/tokens.service';

import { NotFoundDto } from 'src/common/dto/not-found.dto';

import { LoginUserDto } from '../dto/login/login-user.dto';
import { LoginUserResponseDto } from '../dto/login/login-user-response.dto';
import { UnauthorizedDto } from 'src/common/dto/unauthorized.dto';

@ApiTags('Authentication')
@Controller('auth')
export class LoginController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login User' })
  @ApiAcceptedResponse({ type: LoginUserResponseDto })
  @ApiNotFoundResponse({ type: NotFoundDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedDto })
  async login(@Body() loginUserDto: LoginUserDto, @Res() reply: FastifyReply) {
    const user = await this.userAuthService.validateUser(loginUserDto);

    const tokens = this.tokenService.generateTokens(user.id);

    return reply.status(HttpStatus.ACCEPTED).send({
      status: 'success',
      message: 'User logged in successfully',
      user,
      tokens,
    });
  }
}
