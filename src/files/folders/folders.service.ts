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

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepo: Repository<Folder>,
    @InjectRepository(Folder)
    private readonly folderTreeRepo: TreeRepository<Folder>,
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
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
      this.ensureOwner(parent, ownerId);
    }

    const entity = this.folderRepo.create({
      name,
      owner: { id: ownerId } as User,
      parent,
    });
    return this.folderRepo.save(entity);
  }

  async renameOrMove(
    folderId: string,
    userId: string,
    opts: { name?: string; newParentId?: string },
  ) {
    const folder = await this.findOneOrFail(folderId);
    this.ensureOwner(folder, userId);

    if (typeof opts.name === 'string' && opts.name.trim().length) {
      folder.name = opts.name.trim();
    }

    if (opts.newParentId !== undefined) {
      let newParent: Folder | null = null;
      if (opts.newParentId) {
        newParent = await this.findOneOrFail(opts.newParentId);
        this.ensureOwner(newParent, userId);

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
    this.ensureOwner(folder, userId);
    await this.folderRepo.remove(folder);
  }

  async getContents(folderId: string, userId: string) {
    const folder = await this.findOneOrFail(folderId);
    this.ensureOwner(folder, userId);

    const subFolders = await this.folderRepo.find({
      where: { parent: { id: folder.id } },
      relations: ['owner', 'parent'],
      order: { name: 'ASC' },
    });

    const files = await this.fileRepo.find({
      where: { folder: { id: folder.id } },
      relations: ['type', 'tags', 'owner', 'permissions', 'permissions.user'],
      order: { createdAt: 'DESC' },
    });

    return { folder, subFolders, files };
  }

  async path(folderId: string, userid: string) {
    const folder = await this.findOneOrFail(folderId);
    this.ensureOwner(folder, userid);
    const ancestors = await this.folderTreeRepo.findAncestors(folder);
    return ancestors;
  }
}
