import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }

  async findAll(searchUserDto: SearchUserDto) {
    const { firstName, limit, page } = searchUserDto;

    const [users, total] = await this.userRepository.findAndCount({
      where: {
        firstName: ILike(`%${firstName}%`),
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: plainToInstance(UserDto, users),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByPhoneNumber(phoneNumber: string) {
    return await this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
}
