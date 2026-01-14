import { Injectable } from '@nestjs/common';

import { type DrizzleDB, InjectpgDb } from 'src/db/pg';
import { userEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectpgDb() private readonly db: DrizzleDB) {}

  async create(createUserDto: CreateUserDto) {
    const [createdUser] = await this.db
      .insert(userEntity)
      .values(createUserDto)
      .returning();
    return createdUser;
  }
}
