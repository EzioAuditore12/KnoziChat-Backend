import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { verify } from '@node-rs/argon2';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { minutes } from '@nestjs/throttler';
import type { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { UserService } from 'src/user/user.service';

import { RegisterUserDto } from '../dto/register/register-user.dto';
import { VerifyRegisterUserDto } from '../dto/register/verify-register-user.dto';

import { LoginUserDto } from '../dto/login/login-user.dto';
import { RegisterUserResponseDto } from '../dto/register/register-user.response.dto';
import {
  SEND_SMS_QUEUE_NAME,
  SendMessageJobData,
} from '../workers/send-sms.worker';
import { PublicUserDto, publicUserSchema } from 'src/user/dto/public-user.dto';

const regiseration_cache_key = 'register';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class UserAuthService {
  private readonly cacheTime: number = minutes(5);

  constructor(
    private readonly userService: UserService,
    @InjectQueue(SEND_SMS_QUEUE_NAME) private readonly sendMessageQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async registerUser(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    const user = await this.userService.findByPhoneNumber(
      registerUserDto.phoneNumber,
    );

    if (user)
      throw new ConflictException('User with this phone number already exists');

    const otp = generateOtp();

    // Set OTP with 5 minutes (300 seconds) TTL
    await this.cacheManager.set(
      `${regiseration_cache_key}:${registerUserDto.phoneNumber}`,
      { ...registerUserDto, otp },
      this.cacheTime, // 5 minutes in seconds
    );

    await this.sendMessage({
      recipient: registerUserDto.phoneNumber,
      message: `Your KnoziChat OTP is: ${otp}`,
    });

    return {
      status: 'success',
      message: 'Otp Sent for verification',
      duration: this.cacheTime,
      phoneNumber: registerUserDto.phoneNumber,
    };
  }

  async sendMessage({ message, recipient }: SendMessageJobData) {
    await this.sendMessageQueue.add('process', {
      message,
      recipient,
    });
  }

  async verifyUser(
    verifyRegisterUserDto: VerifyRegisterUserDto,
  ): Promise<PublicUserDto> {
    const cacheKey = `${regiseration_cache_key}:${verifyRegisterUserDto.phoneNumber}`;
    const cachedData = await this.cacheManager.get<
      { otp: string } & RegisterUserDto
    >(cacheKey);

    if (!cachedData)
      throw new NotFoundException(
        'No registration data found for this phone number',
      );

    const { otp: cachedOtp, ...registerationDetails } = cachedData;

    if (Number(cachedOtp) !== verifyRegisterUserDto.otp)
      throw new UnauthorizedException('Invalid OTP');

    const userDetails = await this.userService.create(registerationDetails);

    if (
      userDetails.expoPushToken !== undefined &&
      userDetails.expoPushToken !== null
    )
      await this.userService.updateExpoPushToken(
        userDetails.id,
        userDetails.expoPushToken,
      );

    await this.cacheManager.del(cacheKey);

    return publicUserSchema.strip().parse(userDetails);
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<PublicUserDto> {
    const { phoneNumber, password, expoPushToken } = loginUserDto;

    const user = await this.userService.findByPhoneNumber(phoneNumber);

    if (!user)
      throw new NotFoundException('User with this phone number does not exist');

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid)
      throw new UnauthorizedException(
        'Either entered email is wrong or password',
      );

    if (expoPushToken !== undefined && expoPushToken !== null)
      await this.userService.updateExpoPushToken(user.id, expoPushToken);

    return publicUserSchema.strip().parse(user);
  }
}
