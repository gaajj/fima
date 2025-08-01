import { Exclude } from 'class-transformer';
import { User } from './user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.sessions, { onDelete: 'CASCADE' })
  @Exclude()
  user: User;

  @Column()
  @Exclude()
  hashedRefreshToken: string;

  @Column({ default: 0 })
  @Exclude()
  tokenVersion: number;

  @Column({ default: false })
  @Exclude()
  revoked: boolean;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ip?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
