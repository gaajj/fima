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
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { FileResponseDto } from './dto/file.response.dto';
import { User } from 'src/user/entities/user.entity';
import { UpdateFileInfoRequestDto } from './dto/update-file-info.request.dto';
import { AddTagRequestDto } from './dto/add-tag.request.dto';
import { SetFileTypeRequestDto } from './file-types/dto/set-file-type.request.dto';
import { UpdateFileMetadataRequestDto } from './file-types/dto/update-file-metadata.request.dto';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { UploadFileRequestDto } from './dto/upload-file.request.dto';
import { MoveFileToFolderRequestDto } from './dto/move-file-to-folder.request.dto';
import { AuthorizationService } from 'src/auth/authorization.service';
import { AddAclEntryRequestDto } from './dto/add-acl-entry.request.dto';
import { AclRole } from './enums/acl-role.enum';
import { AclEntryResponseDto } from './dto/acl-entry.response.dto';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly authService: AuthorizationService,
  ) {}

  @Get()
  async getAll(): Promise<FileResponseDto[]> {
    const files = await this.filesService.findAll();
    return plainToInstance(FileResponseDto, files);
  }

  @Get(':fileId')
  async getOne(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const file = await this.filesService.findOneOrFail(fileId);
    if (!(await this.authService.canViewFile(file, userId)))
      throw new ForbiddenException('Not authorized');
    return plainToInstance(FileResponseDto, file);
  }

  @Get(':fileId/download')
  async download(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.filesService.findOneOrFail(fileId);
    if (!(await this.authService.canViewFile(file, userId)))
      throw new ForbiddenException('Not authorized');

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    );
    const stream = createReadStream(file.path);
    stream.on('error', () => {
      res.status(HttpStatus.NOT_FOUND).send('File not found');
    });
    stream.pipe(res);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'No file provided or file was rejected by upload policy',
      );
    }

    let created = await this.filesService.create({
      path: file.path,
      originalName: file.originalname,
      displayName: file.filename,
      mimeType: file.mimetype,
      size: file.size.toString(),
      owner: { id: userId } as User,
    });

    if (dto?.typeId) {
      created = await this.filesService.setType(created.id, dto.typeId, userId);
    }
    if (dto?.tagIds?.length) {
      for (const tagId of dto.tagIds) {
        await this.filesService.addTag(created.id, tagId, userId);
      }
      created = await this.filesService.findOneOrFail(created.id);
    }
    if (dto?.folderId) {
      const moved = await this.filesService.moveToFolder(
        created.id,
        dto.folderId,
        userId,
      );
      created = moved;
    }

    return plainToInstance(FileResponseDto, created);
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

  @Post(':fileId/acl')
  @HttpCode(HttpStatus.CREATED)
  async addAcl(
    @Param('fileId') fileId: string,
    @Body() dto: AddAclEntryRequestDto,
    @CurrentUser('id') actorId: string,
  ): Promise<AclEntryResponseDto> {
    const entry = await this.filesService.addAclEntry(
      fileId,
      dto.userId,
      dto.role as AclRole,
      actorId,
    );
    return plainToInstance(AclEntryResponseDto, entry);
  }

  @Delete(':fileId/acl/:entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAcl(
    @Param('fileId') fileId: string,
    @Param('entryId') entryId: string,
    @CurrentUser('id') actorId: string,
  ): Promise<void> {
    await this.filesService.removeAclEntry(fileId, entryId, actorId);
  }

  @Patch(':fileId/folder')
  async moveToFolder(
    @Param('fileId') fileId: string,
    @Body() dto: MoveFileToFolderRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<FileResponseDto> {
    const updated = await this.filesService.moveToFolder(
      fileId,
      dto.folderId,
      userId,
    );
    return plainToInstance(FileResponseDto, updated);
  }
}
