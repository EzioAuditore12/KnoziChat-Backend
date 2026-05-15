import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiAcceptedResponse } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { AuthorizeUploadRequestDto } from './dto/authorize/authorize-upload-request.dto';
import { AuthorizeUploadResponseDto } from './dto/authorize/authorize-upload-response.dto';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { UploadsService } from './uploads.service';
import { env } from 'src/env';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('authorize')
  @ApiAcceptedResponse({ type: AuthorizeUploadResponseDto })
  public async authorizeUpload(
    @Req() req: AuthRequest,
    @Body() authorizeUploadRequestDto: AuthorizeUploadRequestDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const isExistingAppWriteUser =
      await this.uploadsService.isExistingUser(userId);

    if (!isExistingAppWriteUser) await this.uploadsService.createUser(userId);

    const token = await this.uploadsService.generateToken(userId);

    return reply.status(HttpStatus.ACCEPTED).send({
      allowed: true,
      token: token.secret,
      userId,
      projectId: env.APPWRITE_PROJECT_ID,
      endpoint: env.APPWRITE_END_POINT,
      bucketId: env.APPWRITE_IMAGES_BUCKET_ID,
    });
  }
}
