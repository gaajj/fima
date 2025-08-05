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
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { FilePermission } from './file-permission.entity';
import { SharedLink } from './shared-link.entity';
import { FileComment } from './file-comment.entity';
import { Expose } from 'class-transformer';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  path: string;

  @Column()
  @Expose()
  originalName: string;

  @Column()
  @Expose()
  displayName: string;

  @Column()
  @Expose()
  mimeType: string;

  @Column('bigint')
  @Expose()
  size: string;

  @ManyToOne(() => User, (u) => u.sessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Expose()
  owner?: User;

  @ManyToMany(() => Category, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'file_categories',
    joinColumn: { name: 'fileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  @Expose()
  categories: Category[];

  @ManyToMany(() => Tag, (t) => t.files, { cascade: true })
  @JoinTable({
    name: 'file_tags',
    joinColumn: { name: 'fileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  @Expose()
  tags: Tag[];

  @OneToMany(() => FilePermission, (p) => p.file, { cascade: true })
  @Expose()
  permissions: FilePermission[];

  @OneToMany(() => SharedLink, (l) => l.file, { cascade: true })
  @Expose()
  sharedLinks: SharedLink[];

  @OneToMany(() => FileComment, (c) => c.file, { cascade: true })
  @Expose()
  comments: FileComment[];

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}
