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
import { TagsService } from './tags.service';
import { TagResponseDto } from './dto/tag.response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateTagRequestDto } from './dto/create-tag.request.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateTagRequestDto } from './dto/update-tag.request.dto';

@Controller('files/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string): Promise<TagResponseDto[]> {
    const tags = await this.tagsService.findAll(userId);
    return plainToInstance(TagResponseDto, tags);
  }

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTagRequestDto,
  ): Promise<TagResponseDto> {
    const tag = await this.tagsService.create(dto, userId);
    return plainToInstance(TagResponseDto, tag);
  }

  @Patch(':tagId')
  async update(
    @Param('tagId') tagId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTagRequestDto,
  ): Promise<TagResponseDto> {
    const tag = await this.tagsService.update(tagId, dto, userId);
    return plainToInstance(TagResponseDto, tag);
  }

  @Delete(':tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('tagId') tagId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.tagsService.remove(tagId, userId);
  }
}
