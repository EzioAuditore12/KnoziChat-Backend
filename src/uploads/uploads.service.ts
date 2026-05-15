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

  public async generateToken(userId: string): Promise<Models.Token> {
    return await appWriteUsers.createToken({ userId });
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
