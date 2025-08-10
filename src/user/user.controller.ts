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
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { UpdateUserRequestDto } from './dto/update-user.request.dto';
import { EmailVerificationService } from 'src/auth/email-verification/email-verification.service';
import { PublicUserResponseDto } from './dto/public-user.response.dto';
import { plainToInstance } from 'class-transformer';
import { MeUserResponseDto } from './dto/me-user.response.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly evService: EmailVerificationService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser('id') userId: string): Promise<MeUserResponseDto> {
    const user = await this.userService.findOne(userId);
    return plainToInstance(MeUserResponseDto, user);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserRequestDto): Promise<PublicUserResponseDto> {
    const user = await this.userService.create(dto);
    await this.evService.sendVerificationEmail(user);
    return plainToInstance(PublicUserResponseDto, user);
  }

  @Patch()
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<MeUserResponseDto> {
    const updated = await this.userService.update(userId, dto);
    return plainToInstance(MeUserResponseDto, updated);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser('id') userId: string): Promise<void> {
    await this.userService.remove(userId);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string): Promise<PublicUserResponseDto> {
    const user = await this.userService.findOne(userId);
    return plainToInstance(PublicUserResponseDto, user);
  }
}
