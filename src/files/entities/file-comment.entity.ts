import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from './file.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('file_comments')
export class FileComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => File, (f) => f.comments, { onDelete: 'CASCADE' })
  file: File;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  author: User;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
