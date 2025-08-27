import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tag } from '../tags/entities/tag.entity';
import { FilePermission } from './file-permission.entity';
import { SharedLink } from './shared-link.entity';
import { FileComment } from './file-comment.entity';
import { FileType } from '../file-types/entities/file-type.entity';
import { Folder } from '../folders/entities/folder.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @Column()
  originalName: string;

  @Column()
  displayName: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  size: string;

  @ManyToOne(() => FileType, { nullable: true, onDelete: 'SET NULL' })
  type?: FileType;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @ManyToOne(() => User, (u) => u.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  owner?: User;

  @ManyToOne(() => Folder, (f) => f.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  folder?: Folder;

  @ManyToMany(() => Tag, (t) => t.files, { cascade: true })
  @JoinTable({
    name: 'file_tags',
    joinColumn: { name: 'fileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => FilePermission, (p) => p.file, { cascade: true })
  permissions: FilePermission[];

  @OneToMany(() => SharedLink, (l) => l.file, { cascade: true })
  sharedLinks: SharedLink[];

  @OneToMany(() => FileComment, (c) => c.file, { cascade: true })
  comments: FileComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
