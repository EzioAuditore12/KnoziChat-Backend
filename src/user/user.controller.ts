import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Paginate() paginateQuery: PaginateQuery) {
    return this.userService.findAll(paginateQuery);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.userService.findOne(id);

    if (!user) throw new NotFoundException(`User not found with this ${id}`);

    return plainToInstance(UserDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthRequest) {
    const user = this.userService.findOne(req.user.id);

    return plainToInstance(UserDto, user);
  }
}
