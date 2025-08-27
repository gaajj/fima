import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { File } from './file.entity';
import { Folder } from '../folders/entities/folder.entity';
import { AclRole } from '../enums/acl-role.enum';

@Entity('acl_entries')
@Unique('UQ_acl_user_target', ['user', 'file', 'folder'])
export class AclEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => File, (f) => f.aclEntries, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  file?: File | null;

  @ManyToOne(() => Folder, (f) => f.aclEntries, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  folder?: Folder | null;

  @Column({ type: 'enum', enum: AclRole })
  role: AclRole;

  @CreateDateColumn()
  grantedAt: Date;
}
