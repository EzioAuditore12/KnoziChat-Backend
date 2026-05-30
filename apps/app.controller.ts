import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  type MulterFile,
} from '@webundsoehne/nest-fastify-file-upload';

import { AppService } from './app.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import appWriteClient, { appWriteStorage } from './uploads/configs/appwrite';
import { env } from './env';
import { ID, Permission, Role } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Patch('/file')
  @ApiOperation({ summary: 'Uploads a single file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async singleFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 18375930 })],
      }),
    )
    file: MulterFile,
  ) {
    const uploadedFile = await appWriteStorage.createFile({
      bucketId: env.APPWRITE_IMAGES_BUCKET_ID,
      fileId: ID.unique(),

      file: InputFile.fromPath(file.path, file.originalname),
    });

    return uploadedFile;
  }

  @Patch('/files')
  @ApiOperation({ summary: 'Uploads multiple files' })
  @ApiConsumes('multipart/form-data')
  multipleFiles() {
    return console.log('World');
  }
}
