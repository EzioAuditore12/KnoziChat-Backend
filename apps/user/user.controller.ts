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
import {
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileInterceptor,
  MulterFile,
} from '@webundsoehne/nest-fastify-file-upload';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import { ApiAuthHeader } from 'apps/common/decorators/swagger/api-auth-header.decorator';
import { MultipleUuidDto } from 'apps/common/dto/multiple-uuid.dto';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

import { PublicUserDto, publicUserSchema } from './dto/public-user.dto';
import { SerachUserResponseDto } from './dto/search-user/search-user-response.dto';
import { SearchUserDto } from './dto/search-user/search-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Find all users' })
  @ApiQuery({ type: SearchUserDto })
  @ApiResponse({ type: SerachUserResponseDto })
  findAll(
    @Paginate() paginateQuery: PaginateQuery,
  ): Promise<SerachUserResponseDto> {
    return this.userService.findAll(paginateQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiResponse({ type: PublicUserDto })
  async findOne(@Param('id') id: string): Promise<PublicUserDto> {
    const user = await this.userService.findOne(id);

    if (!user) throw new NotFoundException(`User not found with this ${id}`);

    return publicUserSchema.strip().parse(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
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
  @ApiOperation({ summary: 'Get user profile' })
  @ApiAuthHeader()
  @ApiResponse({ type: PublicUserDto })
  async getProfile(@Req() req: AuthRequest) {
    const user = await this.userService.findOne(req.user.id);

    return publicUserSchema.strip().parse(user);
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Find multiple users by ID' })
  @ApiResponse({ type: [PublicUserDto] })
  async findMutilple(@Body() multipleUuidDto: MultipleUuidDto) {
    const users = await this.userService.findMultipleById(
      multipleUuidDto.participants,
    );

    return users;
  }
}
