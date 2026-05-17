import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MulterModule } from '@webundsoehne/nest-fastify-file-upload';

import { UploadsService } from 'src/uploads/uploads.service';
import { UploadsModule } from 'src/uploads/uploads.module';

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
