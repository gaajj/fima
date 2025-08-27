import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { Repository, TreeRepository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { File } from '../entities/file.entity';
import { AuthorizationService } from 'src/auth/authorization.service';
import { AclEntry } from '../entities/acl-entry.entity';
import { AclRole } from '../enums/acl-role.enum';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
    @InjectRepository(Folder)
    private readonly folderTreeRepo: TreeRepository<Folder>,
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(AclEntry)
    private readonly aclRepo: Repository<AclEntry>,
    private readonly authService: AuthorizationService,
  ) {}

  async findOneOrFail(id: string): Promise<Folder> {
    const file = await this.folderRepo.findOne({
      where: { id },
      relations: ['owner', 'parent'],
    });
    if (!file) throw new NotFoundException(`Folder '${id}' not found`);
    return file;
  }

  private ensureOwner(folder: Folder, userId: string) {
    if (!folder.owner || folder.owner.id !== userId) {
      throw new ForbiddenException('Not authorized for this folder');
    }
  }

  async create(name: string, ownerId: string, parentId?: string) {
    let parent: Folder | undefined;
    if (parentId) {
      parent = await this.findOneOrFail(parentId);
      if (!(await this.authService.canEditFolder(parent, ownerId)))
        throw new ForbiddenException('Not authorized for parent folder');
    }

    const entity = this.folderRepo.create({
      name,
      owner: { id: ownerId } as User,
      parent,
    });
    const saved = await this.folderRepo.save(entity);

    await this.aclRepo.save(
      this.aclRepo.create({
        folder: saved,
        user: { id: ownerId } as User,
        role: AclRole.OWNER,
      }),
    );

    return saved;
  }

  async renameOrMove(
    folderId: string,
    userId: string,
    opts: { name?: string; newParentId?: string },
  ) {
    const folder = await this.findOneOrFail(folderId);
    if (!(await this.authService.canEditFolder(folder, userId)))
      throw new ForbiddenException('Not authorized');

    if (typeof opts.name === 'string' && opts.name.trim().length) {
      folder.name = opts.name.trim();
    }

    if (opts.newParentId !== undefined) {
      let newParent: Folder | null = null;
      if (opts.newParentId) {
        newParent = await this.findOneOrFail(opts.newParentId);
        if (!(await this.authService.canEditFolder(newParent, userId)))
          throw new ForbiddenException('Not authorized for target folder');

        const descendants = await this.folderTreeRepo.findDescendants(folder);
        if (descendants.some((d) => d.id === newParent!.id)) {
          throw new BadRequestException('Cannot move into a descendant folder');
        }
      }
      folder.parent = newParent || undefined;
    }

    return this.folderRepo.save(folder);
  }

  async remove(folderId: string, userId: string): Promise<void> {
    const folder = await this.findOneOrFail(folderId);
    if (!(await this.authService.canDeleteFolder(folder, userId)))
      throw new ForbiddenException('Not authorized');
    await this.folderRepo.remove(folder);
  }

  async getContents(folderId: string, userId: string) {
    const folder = await this.findOneOrFail(folderId);
    if (!(await this.authService.canViewFolder(folder, userId)))
      throw new ForbiddenException('Not authorized');

    const subFolders = await this.folderRepo.find({
      where: { parent: { id: folder.id } },
      relations: ['owner', 'parent'],
      order: { name: 'ASC' },
    });

    const files = await this.fileRepo.find({
      where: { folder: { id: folder.id } },
      relations: ['type', 'tags', 'owner', 'aclEntries', 'aclEntries.user'],
      order: { createdAt: 'DESC' },
    });

    return { folder, subFolders, files };
  }

  async path(folderId: string, userId: string) {
    const folder = await this.findOneOrFail(folderId);
    if (!(await this.authService.canViewFolder(folder, userId)))
      throw new ForbiddenException('Not authorized');
    const ancestors = await this.folderTreeRepo.findAncestors(folder);
    return ancestors;
  }
}
