import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { SendMessageService } from 'src/common/services/send-sms.service';
import { UserService } from 'src/user/user.service';

import { RegisterUserDto } from '../dto/register/register-user.dto';
import { VerifyRegisterUserDto } from '../dto/register/verify-register-user.dto';

import { LoginUserDto } from '../dto/login/login-user.dto';

const regiseration_cache_key = 'register';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class UserAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sendMessageService: SendMessageService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const user = await this.userService.findByPhoneNumber(
      registerUserDto.phoneNumber,
    );

    if (user)
      throw new ConflictException('User with this phone number already exists');

    const otp = generateOtp();

    await this.cacheManager.set(
      `${regiseration_cache_key}:${registerUserDto.phoneNumber}`,
      { ...registerUserDto, otp },
    );

    await this.sendMessageService.sendMessage({
      recipient: registerUserDto.phoneNumber,
      message: `Your KnoziChat OTP is: ${otp}`,
    });
  }

  async verifyUser(verifyRegisterUserDto: VerifyRegisterUserDto) {
    const cacheKey = `${regiseration_cache_key}:${verifyRegisterUserDto.phoneNumber}`;
    const cachedData = await this.cacheManager.get<
      { otp: string } & RegisterUserDto
    >(cacheKey);

    if (!cachedData)
      throw new NotFoundException(
        'No registration data found for this phone number',
      );

    const { otp: cachedOtp, ...registerationDetails } = cachedData;

    if (cachedOtp !== verifyRegisterUserDto.otp)
      throw new UnauthorizedException('Invalid OTP');

    const { password, ...userDetails } =
      await this.userService.create(registerationDetails);

    await this.cacheManager.del(cacheKey);

    return userDetails;
  }

  async validateUser(loginUserDto: LoginUserDto) {
    const user = await this.userService.findByPhoneNumber(
      loginUserDto.phoneNumber,
    );

    if (!user)
      throw new NotFoundException('User with this phone number does not exist');

    const { password: userPassword, ...userDetails } = user;

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      userPassword,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException(
        'Either entered email is wrong or password',
      );

    return userDetails;
  }
}
