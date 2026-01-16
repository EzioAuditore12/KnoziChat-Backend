import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

import { UserService } from './user.service';

import { PublicUserDto, publicUserSchema } from './dto/public-user.dto';
import { SearchUserDto } from './dto/search-user/search-user.dto';
import { SerachUserResponseDto } from './dto/search-user/search-user-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';

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
}
