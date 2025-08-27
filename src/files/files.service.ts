import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { rm } from 'fs/promises';
import { UpdateFileInfoRequestDto } from './dto/update-file-info.request.dto';
import { Tag } from './tags/entities/tag.entity';
import Ajv from 'ajv';
import { FileTypesService } from './file-types/file-types.service';
import { User } from 'src/user/entities/user.entity';
import { Folder } from './folders/entities/folder.entity';
import { AclEntry } from './entities/acl-entry.entity';
import { AuthorizationService } from 'src/auth/authorization.service';
import { AclRole } from './enums/acl-role.enum';

const ajv = new Ajv({ allErrors: true });

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File) private readonly fileRepo: Repository<File>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    private readonly fileTypesService: FileTypesService,
    @InjectRepository(Folder) private readonly folderRepo: Repository<Folder>,
    @InjectRepository(AclEntry) private readonly aclRepo: Repository<AclEntry>,
    private readonly authService: AuthorizationService,
  ) {}

  async findAll(): Promise<File[]> {
    return await this.fileRepo.find({
      relations: [
        'type',
        'tags',
        'owner',
        'aclEntries',
        'aclEntries.user',
        'folder',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrFail(fileId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: [
        'type',
        'tags',
        'owner',
        'aclEntries',
        'aclEntries.user',
        'folder',
        'folder.owner',
        'folder.parent',
      ],
    });
    if (!file)
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    return file;
  }

  async create(data: Partial<File>): Promise<File> {
    const file = this.fileRepo.create({ metadata: {}, ...data });
    const saved = await this.fileRepo.save(file);
    if (saved.owner?.id) {
      await this.ensureOwnerAclForFile(saved.id, saved.owner.id);
    }
    return saved;
  }

  private async ensureOwnerAclForFile(fileId: string, ownerId: string) {
    const exists = await this.aclRepo.findOne({
      where: { file: { id: fileId }, user: { id: ownerId } },
    });
    if (!exists) {
      await this.aclRepo.save(
        this.aclRepo.create({
          file: { id: fileId } as File,
          user: { id: ownerId } as User,
          role: AclRole.OWNER,
        }),
      );
    }
  }

  // Currently can only update the displayName
  // TODO: add way to both create and update full file including categories and tags
  async updateInfo(
    fileId: string,
    dto: UpdateFileInfoRequestDto,
    userId: string,
  ): Promise<File> {
    const file = await this.findOneOrFail(fileId);
    if (!(await this.authService.canEditFile(file, userId))) {
      throw new ForbiddenException(`Not authorized to update this file`);
    }
    file.displayName = dto.displayName;
    return this.fileRepo.save(file);
  }

  async remove(fileId: string, userId: string): Promise<void> {
    const file = await this.findOneOrFail(fileId);
    if (!(await this.authService.canDeleteFile(file, userId))) {
      throw new ForbiddenException(`Not authorized to delete this file`);
    }

    await rm(file.path, { force: true });

    await this.fileRepo.remove(file);
  }

  async setType(fileId: string, typeId: string, userId: string): Promise<File> {
    const file = await this.findOneOrFail(fileId);
    if (!(await this.authService.canEditFile(file, userId))) {
      throw new ForbiddenException(`Not authorized`);
    }

    const type = await this.fileTypesService.findOneOrFail(typeId);

    file.type = type;
    file.metadata = {};
    return this.fileRepo.save(file);
  }

  async updateMetadata(
    fileId: string,
    metadata: Record<string, any>,
    userId: string,
  ): Promise<File> {
    const file = await this.findOneOrFail(fileId);
    if (!(await this.authService.canEditFile(file, userId))) {
      throw new ForbiddenException(`Not authorized`);
    }

    if (!file.type) throw new BadRequestException('File has no type set');

    const schema = await this.fileTypesService.getJsonSchema(file.type.id);
    const validate = ajv.compile(schema);
    if (!validate(metadata)) {
      throw new BadRequestException({
        message: 'Invalid metadata',
        details: validate.errors,
      });
    }

    file.metadata = metadata;
    return this.fileRepo.save(file);
  }

  async addTag(fileId: string, tagId: string, userId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['tags', 'owner'],
    });
    if (!file)
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    if (!file.owner || file.owner.id !== userId)
      throw new ForbiddenException(`Not authorized`);

    const tag = await this.tagRepo.findOneBy({ id: tagId });
    if (!tag) throw new NotFoundException(`Tag with ID '${tagId}' not found`);

    if (!file.tags.find((t) => t.id === tag.id)) {
      file.tags.push(tag);
      await this.fileRepo.save(file);
    }
    return file;
  }

  async removeTag(
    fileId: string,
    tagId: string,
    userId: string,
  ): Promise<void> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['tags', 'owner'],
    });
    if (!file)
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    if (!file.owner || file.owner.id !== userId)
      throw new ForbiddenException(`Not authorized`);

    file.tags = file.tags.filter((t) => t.id !== tagId);
    await this.fileRepo.save(file);
  }

  async addAclEntry(
    fileId: string,
    targetUserId: string,
    role: AclRole,
    actorId: string,
  ) {
    const file = await this.findOneOrFail(fileId);
    if (!(await this.authService.canShareFile(file, actorId)))
      throw new ForbiddenException(`Not authorized`);

    const existing = await this.aclRepo.findOne({
      where: { file: { id: fileId }, user: { id: targetUserId } },
    });
    if (existing) {
      existing.role = role;
      await this.aclRepo.save(existing);
      return this.aclRepo.findOneOrFail({
        where: { id: existing.id },
        relations: ['user'],
      });
    }

    const entry = this.aclRepo.create({
      file,
      user: { id: targetUserId } as User,
      role,
    });
    await this.aclRepo.save(entry);
    return this.aclRepo.findOneOrFail({
      where: { id: entry.id },
      relations: ['user'],
    });
  }

  async removeAclEntry(
    fileId: string,
    entryId: string,
    actorId: string,
  ): Promise<void> {
    const file = await this.findOneOrFail(fileId);
    if (!(await this.authService.canShareFile(file, actorId))) {
      throw new ForbiddenException('Not authorized');
    }
    await this.aclRepo.delete({ id: entryId, file: { id: fileId } as any });
  }

  async moveToFolder(fileId: string, folderId: string, userId: string) {
    const file = await this.findOneOrFail(fileId);
    if (!(await this.authService.canMoveFile(file, userId)))
      throw new ForbiddenException('Not authorized');

    const folder = await this.folderRepo.findOne({
      where: { id: folderId },
      relations: ['owner'],
    });
    if (!folder) throw new NotFoundException(`Folder '${folderId}' not found`);
    if (!(await this.authService.canEditFolder(folder, userId)))
      throw new ForbiddenException('Not authorized for target folder');

    file.folder = folder;
    return this.fileRepo.save(file);
  }
}
