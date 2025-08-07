import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { FileResponseDto } from './dto/file-response.dto';
import { User } from 'src/user/entities/user.entity';
import { AddCategoryDto } from './categories/dto/add-category.dto';
import { UpdateFileInfoDto } from './dto/update-file-info.dto';
import { AddTagDto } from './dto/add-tag.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Get()
  async getAll(): Promise<FileResponseDto[]> {
    const files = await this.filesService.findAll();
    return plainToInstance(FileResponseDto, files);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided or invalid file type');
    }

    const fileUpload = await this.filesService.create({
      path: file.path,
      originalName: file.originalname,
      displayName: file.filename,
      mimeType: file.mimetype,
      size: file.size.toString(),
      owner: { id: userId } as User,
    });
    return plainToInstance(FileResponseDto, fileUpload);
  }

  @Patch(':id')
  async update(
    @Param('id') fileId: string,
    @Body() dto: UpdateFileInfoDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.updateInfo(fileId, dto, userId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') fileId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.filesService.remove(fileId, userId);
  }

  @Post(':id/category')
  @HttpCode(HttpStatus.OK)
  async addCategoryToFile(
    @Param('id') fileId: string,
    @Body() dto: AddCategoryDto,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.addCategory(fileId, dto.categoryId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Post(':id/tag')
  @HttpCode(HttpStatus.OK)
  async addTag(
    @Param('id') fileId: string,
    @Body() dto: AddTagDto,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.addTag(fileId, dto.tagId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Delete(':id/tag/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTag(
    @Param('id') fileId: string,
    @Param('tagId') tagId: string,
  ): Promise<void> {
    await this.filesService.removeTag(fileId, tagId);
  }
}
