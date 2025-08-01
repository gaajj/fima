import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { UserCredential } from './user-credential.entity';
import { UserProfile } from './user-profile.entity';
import { Session } from './session.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;

  @OneToOne(() => UserCredential, (c) => c.user, { cascade: true })
  @Exclude()
  credential: UserCredential;

  @OneToMany(() => Session, (s) => s.user)
  @Exclude()
  sessions: Session[];

  @OneToOne(() => UserProfile, (p) => p.user, { cascade: true })
  profile: UserProfile;

  @Expose()
  get isAdmin() {
    return this.role === Role.ADMIN;
  }
}
