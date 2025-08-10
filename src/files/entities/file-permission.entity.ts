import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from './file.entity';
import { User } from 'src/user/entities/user.entity';
import { PermissionType } from '../enums/permission-type.enum';

@Entity('file_permissions')
export class FilePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => File, (f) => f.permissions, { onDelete: 'CASCADE' })
  file: File;

  @ManyToOne(() => User, (u) => u.filePermissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'enum', enum: PermissionType })
  permission: PermissionType;

  @CreateDateColumn()
  grantedAt: Date;
}
