import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from './file.entity';

@Entity('shared_links')
export class SharedLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => File, (f) => f.sharedLinks, { onDelete: 'CASCADE' })
  file: File;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: 0 })
  maxDownloads: number;

  @Column({ default: 0 })
  downlaodCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
