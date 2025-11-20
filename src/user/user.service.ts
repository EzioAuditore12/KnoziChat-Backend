import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginateQuery, PaginationType, paginate } from 'nestjs-paginate';

import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';

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

  async findAll(query: PaginateQuery) {
    return paginate(query, this.userRepository, {
      sortableColumns: ['firstName', 'middleName', 'lastName'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['firstName', 'middleName', 'lastName'],
      select: [
        'id',
        'avatar',
        'firstName',
        'middleName',
        'lastName',
        'phoneNumber',
        'email',
        'createdAt',
        'updatedAt',
      ],
      defaultLimit: 10,
      maxLimit: 30,
      paginationType: PaginationType.LIMIT_AND_OFFSET,
    });
  }

  async findByPhoneNumber(phoneNumber: string) {
    return await this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
}
