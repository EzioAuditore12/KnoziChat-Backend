import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UserAuthService } from '../services/user-auth.service';

import { ConflictDto } from 'src/common/dto/conflict.dto';
import { NotFoundDto } from 'src/common/dto/not-found.dto';

import { RegisterUserDto } from '../dto/register/register-user.dto';
import { RegisterUserResponseDto } from '../dto/register/register-user.response.dto';

import { VerifyRegisterUserDto } from '../dto/register/verify-register-user.dto';
import { VerifyRegisterUserResponseDto } from '../dto/register/verify-register-user-response.dto';
import { TokenService } from '../services/tokens.service';

@ApiTags('Authentication')
@Controller('auth')
export class RegisterController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register User Form' })
  @ApiCreatedResponse({ type: RegisterUserResponseDto })
  @ApiConflictResponse({ type: ConflictDto })
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res() reply: FastifyReply,
  ) {
    const userSentForRegisteration =
      await this.userAuthService.registerUser(registerUserDto);

    return reply.status(HttpStatus.CREATED).send(userSentForRegisteration);
  }

  @Post('verify-register')
  @ApiOperation({ summary: 'Verify User Registeration' })
  @ApiCreatedResponse({ type: VerifyRegisterUserResponseDto })
  @ApiConflictResponse({ type: NotFoundDto })
  async verifyRegisteration(
    @Body() verifyRegisterUserDto: VerifyRegisterUserDto,
    @Res() reply: FastifyReply,
  ) {
    const user = await this.userAuthService.verifyUser(verifyRegisterUserDto);

    const tokens = this.tokenService.generateTokens(user.id);

    return reply.status(HttpStatus.CREATED).send({
      status: 'success',
      message: 'User Created Successfully',
      user,
      tokens,
    });
  }
}
