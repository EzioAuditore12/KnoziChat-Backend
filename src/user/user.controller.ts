import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

import { UserService } from './user.service';

import { PublicUserDto, publicUserSchema } from './dto/public-user.dto';
import { SearchUserDto } from './dto/search-user/search-user.dto';
import { SerachUserResponseDto } from './dto/search-user/search-user-response.dto';

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
}
