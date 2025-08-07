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
import { TagResponseDto } from './dto/tag-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateTagDto } from './dto/create-tag.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateTagDto } from './dto/update-tag.dto';

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
    @Body() dto: CreateTagDto,
  ): Promise<TagResponseDto> {
    const tag = await this.tagsService.create(dto, userId);
    return plainToInstance(TagResponseDto, tag);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    const tag = await this.tagsService.update(id, dto, userId);
    return plainToInstance(TagResponseDto, tag);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.tagsService.remove(id, userId);
  }
}
