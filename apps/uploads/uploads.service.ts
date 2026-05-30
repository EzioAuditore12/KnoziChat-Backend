import { Injectable, NotFoundException } from '@nestjs/common';
import { ID, type Models } from 'node-appwrite';
import type { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { unlink } from 'node:fs/promises';
import { InputFile } from 'node-appwrite/file';

import {
  appWriteStorage,
  appWriteTokens,
  appWriteUsers,
} from './configs/appwrite';
import { env } from 'apps/env';

@Injectable()
export class UploadsService {
  private readonly appWriteUsers = appWriteUsers;
  private readonly appWriteStorage = appWriteStorage;
  private readonly appWriteTokens = appWriteTokens;

  private readonly appWriteEndPoint = env.APPWRITE_END_POINT;
  private readonly appWriteProjectId = env.APPWRITE_PROJECT_ID;
  private readonly appWriteImageBucketId = env.APPWRITE_IMAGES_BUCKET_ID;
  private readonly appWriteVideoBucketId = env.APPWRITE_VIDEOS_BUCKET_ID;

  public async createUser(
    userId: string,
  ): Promise<Models.User<Models.Preferences>> {
    const result = await this.appWriteUsers.create({ userId });

    return result;
  }

  public async isExistingUser(userId: string): Promise<boolean> {
    try {
      await this.appWriteUsers.get({ userId });
      return true;
    } catch {
      return false;
    }
  }

  public async generateToken(userId: string): Promise<string> {
    const session = await appWriteUsers.createToken({ userId });

    return session.secret;
  }

  public async generateJwtToken(userId: string): Promise<string> {
    const session = await appWriteUsers.createJWT({ userId });

    return session.jwt;
  }

  public getUploadImageBucketUrl(): string {
    const endpoint = `${this.appWriteEndPoint}/storage/buckets/${this.appWriteImageBucketId}/files`;

    return endpoint;
  }

  public getUploadVideoBucketUrl(): string {
    const endpoint = `${this.appWriteEndPoint}/storage/buckets/${this.appWriteVideoBucketId}/files`;

    return endpoint;
  }

  public getProjectId(): string {
    return this.appWriteProjectId;
  }

  public getVideoBucketId(): string {
    return this.appWriteVideoBucketId;
  }

  public getImageBucketId(): string {
    return this.appWriteImageBucketId;
  }

  public getEndpoint(): string {
    return this.appWriteEndPoint;
  }

  public supportedHeadersForUpload(): object {
    const headers = {
      'x-appwrite-project': 'x-appwrite-project',
      'x-appwrite-jwt': 'x-appwrite-jwt',
      'content-range': 'content-range',
      'x-appwrite-id': 'x-appwrite-id',
    };

    return headers;
  }

  public async uploadAvatar(
    file: MulterFile | undefined,
  ): Promise<string | null> {
    if (!file || !file.path || !file.originalname) {
      return null;
    }

    const uploadedAvatar = await this.appWriteStorage.createFile({
      bucketId: env.APPWRTIE_AVATARS_BUCKET_ID,
      fileId: ID.unique(),
      file: InputFile.fromPath(file.path, file.originalname),
    });

    await unlink(file.path);

    const url =
      `${env.APPWRITE_END_POINT}/storage/buckets/${env.APPWRTIE_AVATARS_BUCKET_ID}` +
      `/files/${uploadedAvatar.$id}/preview?project=${env.APPWRITE_PROJECT_ID}`;

    return url ?? null;
  }

  public async verifyUrlAndDownloadLink(url: string): Promise<{
    url: string;
    fileType: 'image' | 'video';
    size: number; // 👈 Add this to the return type
  }> {
    const parsedUrl = new URL(url);

    // Verify endpoint
    if (!parsedUrl.href.startsWith(this.appWriteEndPoint)) {
      throw new NotFoundException('Invalid Appwrite endpoint');
    }

    const parts = parsedUrl.pathname.split('/');
    const bucketId = parts[4];
    const fileId = parts[6];

    if (!bucketId || !fileId) {
      throw new NotFoundException('Invalid Appwrite file URL');
    }

    let fileType: 'image' | 'video';

    if (bucketId === this.appWriteImageBucketId) {
      fileType = 'image';
    } else if (bucketId === this.appWriteVideoBucketId) {
      fileType = 'video';
    } else {
      throw new NotFoundException(`Bucket ${bucketId} is not allowed`);
    }

    // 1. 👇 Get the full file info instead of just a boolean
    const fileInfo = await this.getFileInfo(fileId, bucketId);

    const token = await this.appWriteTokens.createFileToken({
      bucketId,
      fileId,
    });

    // 2. 👇 Change /download to /view for better streaming support
    const downloadUrl =
      `${this.appWriteEndPoint}` +
      `/storage/buckets/${bucketId}` +
      `/files/${fileId}` +
      `/view?project=${this.appWriteProjectId}` +
      `&token=${token.secret}`;

    return {
      url: downloadUrl,
      fileType,
      size: fileInfo.sizeOriginal, // 👈 Return the exact byte size!
    };
  }

  private async isExistingFile(id: string, bucketId: string): Promise<boolean> {
    try {
      await this.appWriteStorage.getFile({
        bucketId,
        fileId: id,
      });

      return true;
    } catch {
      throw new NotFoundException(`Unable to locate file with id = ${id}`);
    }
  }

  private async isExistingBucket(id: string): Promise<boolean> {
    const allowedBuckets = [
      this.appWriteImageBucketId,
      this.appWriteVideoBucketId,
    ];

    if (!allowedBuckets.includes(id)) {
      throw new NotFoundException(`Unable to locate bucket with id = ${id}`);
    }

    return true;
  }

  private async getFileInfo(
    id: string,
    bucketId: string,
  ): Promise<Models.File> {
    try {
      return await this.appWriteStorage.getFile({
        bucketId,
        fileId: id,
      });
    } catch {
      throw new NotFoundException(`Unable to locate file with id = ${id}`);
    }
  }
}
