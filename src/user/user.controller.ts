import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiHeader, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';

import { UserService } from './user.service';

import { PublicUserDto, publicUserSchema } from './dto/public-user.dto';
import { SearchUserDto } from './dto/search-user/search-user.dto';
import { SerachUserResponseDto } from './dto/search-user/search-user-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { MultipleUuidDto } from 'src/common/dto/multiple-uuid.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiQuery({ type: SearchUserDto })
  @ApiResponse({ type: SerachUserResponseDto })
  findAll(
    @Paginate() paginateQuery: PaginateQuery,
  ): Promise<SerachUserResponseDto> {
    return this.userService.findAll(paginateQuery);
  }

  @Get(':id')
  @ApiResponse({ type: PublicUserDto })
  async findOne(@Param('id') id: string): Promise<PublicUserDto> {
    const user = await this.userService.findOne(id);

    if (!user) throw new NotFoundException(`User not found with this ${id}`);

    return publicUserSchema.strip().parse(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ type: PublicUserDto })
  async updateDetails(
    @Req() req: AuthRequest,
    @UploadedFile()
    avatar: MulterFile | undefined,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.id;

    const { firstName, lastName, middleName } = updateUserDto;

    const updatedUser = await this.userService.update(userId, {
      firstName,
      middleName,
      lastName,
      avatar,
    });

    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({ type: PublicUserDto })
  async getProfile(@Req() req: AuthRequest) {
    const user = await this.userService.findOne(req.user.id);

    return publicUserSchema.strip().parse(user);
  }

  @Post('multiple')
  @ApiResponse({ type: [PublicUserDto] })
  async findMutilple(@Body() multipleUuidDto: MultipleUuidDto) {
    const users = await this.userService.findMultipleById(
      multipleUuidDto.participants,
    );

    return users;
  }
}
