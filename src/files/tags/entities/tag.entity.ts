import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from '../../entities/file.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('tags')
@Index(['createdByUser.id', 'name'], { unique: true })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (u) => u.tags, { onDelete: 'CASCADE' })
  createdByUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => File, (f) => f.tags)
  files: File[];
}
