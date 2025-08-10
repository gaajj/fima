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
import { UpdateFileInfoDto } from './dto/update-file-info.dto';
import { AddTagDto } from './dto/add-tag.dto';
import { SetFileTypeDto } from './file-types/dto/set-file-type.dto';
import { UpdateFileMetadataDto } from './file-types/dto/update-file-metadata.dto';
import { AddPermissionDto } from './dto/add-permission.dto';
import { FilePermissionResponseDto } from './dto/file-permission-response.dto';

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

  @Patch(':id/type')
  async setType(
    @Param('id') fileId: string,
    @Body() dto: SetFileTypeDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.setType(fileId, dto.typeId, userId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Patch(':id/metadata')
  async updateMetadata(
    @Param('id') fileId: string,
    @Body() dto: UpdateFileMetadataDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.updateMetadata(
      fileId,
      dto.metadata,
      userId,
    );
    return plainToInstance(FileResponseDto, updated);
  }

  @Post(':id/tag')
  @HttpCode(HttpStatus.OK)
  async addTagToFile(
    @Param('id') fileId: string,
    @Body() dto: AddTagDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.addTag(fileId, dto.tagId, userId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Delete(':id/tag/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromFile(
    @Param('id') fileId: string,
    @Param('tagId') tagId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.filesService.removeTag(fileId, tagId, userId);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.CREATED)
  async grantPermission(
    @Param('id') fileId: string,
    @Body() dto: AddPermissionDto,
    @CurrentUser('id') userId: string,
  ): Promise<FilePermissionResponseDto> {
    const file = await this.filesService.addPermission(fileId, dto, userId);
    return plainToInstance(FilePermissionResponseDto, file);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokePermission(
    @Param('id') fileId: string,
    @Param('permissionId') permissionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.filesService.removePermission(fileId, permissionId, userId);
  }
}
