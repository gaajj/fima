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
import { FoldersService } from './folders.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateFolderRequestDto } from './dto/create-folder.request.dto';
import { FolderResponseDto } from './dto/folder.response.dto';
import { plainToInstance } from 'class-transformer';
import { FolderContentsResponseDto } from './dto/folder-contents.response.dto';
import { UpdateFolderRequestDto } from './dto/update-folder.request.dto';

@Controller('folders')
export class FoldersController {
  constructor(private readonly svc: FoldersService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFolderRequestDto,
  ): Promise<FolderResponseDto> {
    const folder = await this.svc.create(dto.name, userId, dto.parentId);
    return plainToInstance(FolderResponseDto, {
      ...folder,
      parentId: folder.parent?.id,
    });
  }

  @Patch(':folderId')
  async update(
    @Param('folderId') folderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateFolderRequestDto,
  ): Promise<FolderResponseDto> {
    const folder = await this.svc.renameOrMove(folderId, userId, dto);
    return plainToInstance(FolderResponseDto, {
      ...folder,
      parentId: folder.parent?.id,
    });
  }

  @Get(':folderId')
  async getOne(
    @Param('folderId') folderId: string,
    @CurrentUser('id') userId: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.svc.findOneOrFail(folderId);
    return plainToInstance(FolderResponseDto, {
      ...folder,
      parentId: folder.parent?.id,
    });
  }

  @Get(':folderId/contents')
  async contents(
    @Param('folderId') folderId: string,
    @CurrentUser('id') userId: string,
  ): Promise<FolderContentsResponseDto> {
    const { folder, subFolders, files } = await this.svc.getContents(
      folderId,
      userId,
    );
    return plainToInstance(FolderContentsResponseDto, {
      folder: { ...folder, parentId: folder.parent?.id },
      subfolders: subFolders.map((f) => ({ ...f, parentId: f.parent?.id })),
      files,
    });
  }

  @Get(':folderId/path')
  async path(
    @Param('folderId') folderId: string,
    @CurrentUser('id') userId: string,
  ) {
    const nodes = await this.svc.path(folderId, userId);
    return nodes.map((n) => ({ id: n.id, name: n.name }));
  }

  @Delete(':folderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('folderId') folderId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.svc.remove(folderId, userId);
  }
}
