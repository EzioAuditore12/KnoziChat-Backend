import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiAcceptedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import type { FastifyReply } from 'fastify';

import { AuthorizeDownloadRequestDto } from './dto/authorize/authorize-download-request.dto';
import { AuthorizeDownloadResponseDto } from './dto/authorize/authorize-download-response.dto';
import { AuthorizeUploadRequestDto } from './dto/authorize/authorize-upload-request.dto';
import { AuthorizeUploadResponseDto } from './dto/authorize/authorize-upload-response.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @ApiOperation({
    summary: 'Authorize image upload',
    description:
      'Generates a temporary Appwrite JWT and returns the required project, bucket, and endpoint details to directly upload an image.',
  })
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
  @ApiOperation({
    summary: 'Authorize video upload',
    description:
      'Generates a temporary Appwrite JWT and returns the required project, bucket, and endpoint details to directly upload a video.',
  })
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
  @ApiOperation({
    summary: 'Authorize file download',
    description:
      'Verifies the provided Appwrite file URL and returns a valid download URL with file metadata.',
  })
  @ApiAcceptedResponse({ type: AuthorizeDownloadResponseDto })
  public async authorizeDownload(
    @Req() req: AuthRequest,
    @Body() authorizeDownloadRequestDto: AuthorizeDownloadRequestDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const { url } = authorizeDownloadRequestDto;

    const {
      url: downloadUrl,
      fileType,
      size,
    } = await this.uploadsService.verifyUrlAndDownloadLink(url);

    return reply.status(HttpStatus.ACCEPTED).send({
      allowed: true,
      downloadUrl,
      fileType,
      size,
    });
  }
}
