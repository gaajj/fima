import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { AclEntry } from 'src/files/entities/acl-entry.entity';
import { File } from 'src/files/entities/file.entity';
import { Folder } from 'src/files/folders/entities/folder.entity';
import { AclRole } from 'src/files/enums/acl-role.enum';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(AclEntry) private readonly aclRepo: Repository<AclEntry>,
    @InjectRepository(File) private readonly fileRepo: Repository<File>,
    @InjectRepository(Folder) private readonly folderRepo: Repository<Folder>,
    @InjectRepository(Folder)
    private readonly folderTreeRepo: TreeRepository<Folder>,
  ) {}

  private async effectiveRoleForFolder(
    folder: Folder,
    userId: string,
  ): Promise<AclRole | null> {
    const direct = await this.aclRepo.findOne({
      where: { folder: { id: folder.id }, user: { id: userId } },
      relations: ['user', 'folder'],
    });
    if (direct) return direct.role;

    if (folder.owner?.id === userId) return AclRole.OWNER;

    const ancestors = await this.folderTreeRepo.findAncestors(folder);
    for (let i = ancestors.length - 2; i >= 0; i--) {
      const f = ancestors[i];
      if (f.owner?.id === userId) return AclRole.OWNER;
      const a = await this.aclRepo.findOne({
        where: { folder: { id: f.id }, user: { id: userId } },
        relations: ['user', 'folder'],
      });
      if (a) return a.role;
    }
    return null;
  }

  private async effectiveRoleForFile(
    file: File,
    userId: string,
  ): Promise<AclRole | null> {
    const direct = await this.aclRepo.findOne({
      where: { file: { id: file.id }, user: { id: userId } },
      relations: ['user', 'file'],
    });
    if (direct) return direct.role;

    if (file.owner?.id === userId) return AclRole.OWNER;

    if (file.folder) {
      const fullFolder = await this.folderRepo.findOneOrFail({
        where: { id: file.folder.id },
        relations: ['owner', 'parent'],
      });
      return this.effectiveRoleForFolder(fullFolder, userId);
    }
    return null;
  }

  private has(
    cap: 'view' | 'comment' | 'edit' | 'share' | 'move' | 'delete',
    role: AclRole | null,
  ) {
    if (!role) return false;
    switch (cap) {
      case 'view':
        return [
          AclRole.VIEWER,
          AclRole.COMMENTER,
          AclRole.EDITOR,
          AclRole.OWNER,
        ].includes(role);
      case 'comment':
        return [AclRole.COMMENTER, AclRole.EDITOR, AclRole.OWNER].includes(
          role,
        );
      case 'edit':
        return [AclRole.EDITOR, AclRole.OWNER].includes(role);
      case 'move':
        return [AclRole.EDITOR, AclRole.OWNER].includes(role);
      case 'share':
        return [AclRole.OWNER].includes(role);
      case 'delete':
        return [AclRole.OWNER].includes(role);
    }
  }

  async canViewFile(file: File, userId: string) {
    return this.has('view', await this.effectiveRoleForFile(file, userId));
  }
  async canEditFile(file: File, userId: string) {
    return this.has('edit', await this.effectiveRoleForFile(file, userId));
  }
  async canMoveFile(file: File, userId: string) {
    return this.has('move', await this.effectiveRoleForFile(file, userId));
  }
  async canShareFile(file: File, userId: string) {
    return this.has('share', await this.effectiveRoleForFile(file, userId));
  }
  async canDeleteFile(file: File, userId: string) {
    return this.has('delete', await this.effectiveRoleForFile(file, userId));
  }

  async canViewFolder(folder: Folder, userId: string) {
    return this.has('view', await this.effectiveRoleForFolder(folder, userId));
  }
  async canEditFolder(folder: Folder, userId: string) {
    return this.has('edit', await this.effectiveRoleForFolder(folder, userId));
  }
  async canMoveFolder(folder: Folder, userId: string) {
    return this.has('move', await this.effectiveRoleForFolder(folder, userId));
  }
  async canShareFolder(folder: Folder, userId: string) {
    return this.has('share', await this.effectiveRoleForFolder(folder, userId));
  }
  async canDeleteFolder(folder: Folder, userId: string) {
    return this.has(
      'delete',
      await this.effectiveRoleForFolder(folder, userId),
    );
  }
}
