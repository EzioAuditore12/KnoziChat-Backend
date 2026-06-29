import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@webundsoehne/nest-fastify-file-upload';
import { UploadsModule } from 'apps/uploads/uploads.module';
import { UploadsService } from 'apps/uploads/uploads.service';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    UploadsModule,
    TypeOrmModule.forFeature([User]),
    MulterModule.register({ dest: './public/temp' }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
