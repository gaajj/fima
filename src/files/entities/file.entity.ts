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
import { Category } from '../categories/entities/category.entity';
import { Tag } from './tag.entity';
import { FilePermission } from './file-permission.entity';
import { SharedLink } from './shared-link.entity';
import { FileComment } from './file-comment.entity';

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

  @ManyToOne(() => User, (u) => u.sessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  owner?: User;

  @ManyToMany(() => Category, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'file_categories',
    joinColumn: { name: 'fileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

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
