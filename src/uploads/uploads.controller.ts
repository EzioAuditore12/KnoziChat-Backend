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

import { AuthorizeDownloadRequestDto } from './dto/authorize/authorize-download-request.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @ApiAcceptedResponse({ type: AuthorizeUploadResponseDto })
  public async authorizeUploadImage(
    @Req() req: AuthRequest,
    @Body() authorizeUploadRequestDto: AuthorizeUploadRequestDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const isExistingAppWriteUser =
      await this.uploadsService.isExistingUser(userId);

    if (!isExistingAppWriteUser) await this.uploadsService.createUser(userId);

    const appWriteJwtToken = await this.uploadsService.generateJwtToken(userId);

    return reply.status(HttpStatus.ACCEPTED).send({
      allowed: true,
      projectId: this.uploadsService.getProjectId(),
      bucketId: this.uploadsService.getImageBucketId(),
      endpoint: this.uploadsService.getEndpoint(),
      url: this.uploadsService.getUploadImageBucketUrl(),
      authorizationToken: appWriteJwtToken,
      requiredHeaders: this.uploadsService.supportedHeadersForUpload(),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('video')
  @ApiAcceptedResponse({ type: AuthorizeUploadResponseDto })
  public async authorizeUploadVideo(
    @Req() req: AuthRequest,
    @Body() authorizeUploadRequestDto: AuthorizeUploadRequestDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const isExistingAppWriteUser =
      await this.uploadsService.isExistingUser(userId);

    if (!isExistingAppWriteUser) await this.uploadsService.createUser(userId);

    const appWriteJwtToken = await this.uploadsService.generateJwtToken(userId);

    return reply.status(HttpStatus.ACCEPTED).send({
      allowed: true,
      projectId: this.uploadsService.getProjectId(),
      bucketId: this.uploadsService.getVideoBucketId(),
      endpoint: this.uploadsService.getEndpoint(),
      url: this.uploadsService.getUploadVideoBucketUrl(),
      authorizationToken: appWriteJwtToken,
      requiredHeaders: this.uploadsService.supportedHeadersForUpload(),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('download')
  @ApiAcceptedResponse({ type: AuthorizeUploadResponseDto })
  public async authorizeDownload(
    @Req() req: AuthRequest,
    @Body() authorizeDownloadRequestDto: AuthorizeDownloadRequestDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const { url } = authorizeDownloadRequestDto;

    const { url: downloadUrl, fileType } =
      await this.uploadsService.verifyUrlAndDownloadLink(url);

    return reply.status(HttpStatus.ACCEPTED).send({
      allowed: true,
      downloadUrl,
      fileType,
    });
  }
}
