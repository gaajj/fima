import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailVerificationService } from 'src/auth/email-verification/email-verification.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly evService: EmailVerificationService,
  ) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string): Promise<User | null> {
    return this.userService.findOne(userId);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    await this.evService.sendVerificationEmail(user);
    return user;
  }

  @Patch()
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User | null> {
    return this.userService.update(userId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser('id') userId: string): Promise<void> {
    await this.userService.remove(userId);
  }
}
