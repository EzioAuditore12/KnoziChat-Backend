import { Injectable } from '@nestjs/common';
import { ID, type Models } from 'node-appwrite';
import type { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { unlink } from 'node:fs/promises';
import { InputFile } from 'node-appwrite/file';

import { appWriteStorage, appWriteUsers } from './configs/appwrite';
import { env } from 'src/env';

@Injectable()
export class UploadsService {
  private readonly appWriteUsers = appWriteUsers;
  private readonly appWriteStorage = appWriteStorage;

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
}
