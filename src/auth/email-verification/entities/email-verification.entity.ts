import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Exclude()
  hashedToken: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  verifiedAt?: Date;

  @ManyToOne(() => User, (u) => u.emailVerifications, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column({ default: false })
  expired: boolean;
}
