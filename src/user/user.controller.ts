import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailVerificationService } from 'src/auth/email-verification/email-verification.service';
import { PublicUserDto } from './dto/public-user.dto';
import { plainToInstance } from 'class-transformer';
import { MeUserDto } from './dto/me-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly evService: EmailVerificationService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser('id') userId: string): Promise<MeUserDto> {
    const user = await this.userService.findOne(userId);
    return plainToInstance(MeUserDto, user);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto): Promise<PublicUserDto> {
    const user = await this.userService.create(dto);
    await this.evService.sendVerificationEmail(user);
    return plainToInstance(PublicUserDto, user);
  }

  @Patch()
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<MeUserDto> {
    const updated = await this.userService.update(userId, dto);
    return plainToInstance(MeUserDto, updated);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser('id') userId: string): Promise<void> {
    await this.userService.remove(userId);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string): Promise<PublicUserDto> {
    const user = await this.userService.findOne(userId);
    return plainToInstance(PublicUserDto, user);
  }
}
