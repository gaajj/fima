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
import { FileResponseDto } from './dto/file.response.dto';
import { User } from 'src/user/entities/user.entity';
import { UpdateFileInfoRequestDto } from './dto/update-file-info.request.dto';
import { AddTagRequestDto } from './dto/add-tag.request.dto';
import { SetFileTypeRequestDto } from './file-types/dto/set-file-type.request.dto';
import { UpdateFileMetadataRequestDto } from './file-types/dto/update-file-metadata.request.dto';
import { AddPermissionRequestDto } from './dto/add-permission.request.dto';
import { FilePermissionResponseDto } from './dto/file-permission.response.dto';

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

  @Patch(':fileId')
  async update(
    @Param('fileId') fileId: string,
    @Body() dto: UpdateFileInfoRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.updateInfo(fileId, dto, userId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.filesService.remove(fileId, userId);
  }

  @Patch(':fileId/type')
  async setType(
    @Param('fileId') fileId: string,
    @Body() dto: SetFileTypeRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.setType(fileId, dto.typeId, userId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Patch(':fileId/metadata')
  async updateMetadata(
    @Param('fileId') fileId: string,
    @Body() dto: UpdateFileMetadataRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.updateMetadata(
      fileId,
      dto.metadata,
      userId,
    );
    return plainToInstance(FileResponseDto, updated);
  }

  @Post(':fileId/tag')
  @HttpCode(HttpStatus.OK)
  async addTagToFile(
    @Param('fileId') fileId: string,
    @Body() dto: AddTagRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.addTag(fileId, dto.tagId, userId);
    return plainToInstance(FileResponseDto, updated);
  }

  @Delete(':fileId/tag/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromFile(
    @Param('fileId') fileId: string,
    @Param('tagId') tagId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.filesService.removeTag(fileId, tagId, userId);
  }

  @Post(':fileId/permissions')
  @HttpCode(HttpStatus.CREATED)
  async grantPermission(
    @Param('fileId') fileId: string,
    @Body() dto: AddPermissionRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<FilePermissionResponseDto> {
    const file = await this.filesService.addPermission(fileId, dto, userId);
    return plainToInstance(FilePermissionResponseDto, file);
  }

  @Delete(':fileId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokePermission(
    @Param('fileId') fileId: string,
    @Param('permissionId') permissionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.filesService.removePermission(fileId, permissionId, userId);
  }
}
