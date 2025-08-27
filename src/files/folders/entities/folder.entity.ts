import { AclEntry } from 'src/files/entities/acl-entry.entity';
import { File } from 'src/files/entities/file.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';

@Entity('folders')
@Tree('closure-table')
@Index(['owner', 'name'], { unique: false })
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (u) => u.id, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner?: User;

  @TreeParent()
  parent?: Folder;

  @TreeChildren()
  children: Folder[];

  @OneToMany(() => File, (f) => f.folder)
  files: File[];

  @OneToMany(() => AclEntry, (a) => a.folder, { cascade: true })
  aclEntries: AclEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
