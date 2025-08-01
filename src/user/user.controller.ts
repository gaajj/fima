import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.userService.findOne(userId);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
