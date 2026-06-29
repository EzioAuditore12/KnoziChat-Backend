import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { UploadsService } from 'apps/uploads/uploads.service';
import { Expo } from 'expo-server-sdk';
import { paginate, PaginateQuery, PaginationType } from 'nestjs-paginate';
import { In, MoreThan, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { PublicUserDto, publicUserSchema } from './dto/public-user.dto';
import { SerachUserResponseDto } from './dto/search-user/search-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const user = this.userRepository.create(
          this.normalizeCreateNullableFields(createUserDto),
        );
        return await this.userRepository.save(user);
      } catch (error: any) {
        // 23505 = unique_violation in PostgreSQL (username collision)
        const isUsernameCollision =
          error?.code === '23505' && error?.detail?.includes('username');

        if (!isUsernameCollision || attempt === maxRetries - 1) throw error;
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new Error('Failed to create user after max retries');
  }

  async findOne(id: string): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });

    return user;
  }

  public async areExistingUsers(ids: string[]): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { id: In(ids) },
    });
    return count === ids.length;
  }

  public async findMultipleById(ids: string[]): Promise<PublicUserDto[]> {
    const users = await this.userRepository.find({
      where: { id: In(ids) },
    });

    return publicUserSchema.strip().array().parse(users);
  }

  async findAll(query: PaginateQuery): Promise<SerachUserResponseDto> {
    return paginate(query, this.userRepository, {
      sortableColumns: ['firstName', 'middleName', 'lastName'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['firstName', 'middleName', 'lastName'],
      select: [
        'id',
        'username',
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

  async updateExpoPushToken(
    userId: string,
    expoPushToken: string | undefined,
  ): Promise<void> {
    if (!Expo.isExpoPushToken(expoPushToken))
      throw new BadRequestException('Given token is invalid');

    await this.userRepository.update(userId, { expoPushToken });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserDto | null> {
    return await this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUsersWithChanges(
    ids: string[],
    since: Date,
  ): Promise<PublicUserDto[] | []> {
    if (ids.length === 0) return [];

    const users = await this.userRepository.find({
      where: {
        id: In(ids),
        updatedAt: MoreThan(since),
      },
      select: [
        'id',
        'username',
        'avatar',
        'firstName',
        'middleName',
        'lastName',
        'phoneNumber',
        'email',
        'createdAt',
        'updatedAt',
      ],
    });

    return users;
  }

  public async update(
    id: string,
    updateUserDto: Omit<UpdateUserDto, 'avatar'> & {
      avatar: MulterFile | undefined;
    },
  ): Promise<PublicUserDto> {
    const { avatar, ...rest } = updateUserDto;

    let updatedUploadedAvatar: string | null = null;
    if (avatar) {
      updatedUploadedAvatar = await this.uploadsService.uploadAvatar(avatar);
    }

    const normalizedUser: Partial<User> = { ...rest };

    if (rest.middleName === '') {
      normalizedUser.middleName = null;
    }

    if (updatedUploadedAvatar !== null) {
      normalizedUser.avatar = updatedUploadedAvatar;
    }

    const entityToSave = await this.userRepository.preload({
      id,
      ...normalizedUser,
    });

    if (!entityToSave) {
      throw new NotFoundException(`User not found with id ${id}`);
    }

    const savedUser = await this.userRepository.save(entityToSave);

    return publicUserSchema.strip().parse(savedUser);
  }

  private normalizeCreateNullableFields(data: CreateUserDto): CreateUserDto {
    return {
      ...data,
      middleName: data.middleName ?? null,
      phoneNumber: data.phoneNumber ?? null,
      avatar: data.avatar ?? null,
      expoPushToken: data.expoPushToken ?? null,
    };
  }
}
