import { Injectable } from '@nestjs/common';
import type { Models } from 'node-appwrite';

import { appWriteUsers } from './configs/appwrite';

@Injectable()
export class UploadsService {
  private readonly appWriteUsers = appWriteUsers;

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
}
