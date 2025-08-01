import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity()
export class UserCredential {
  @PrimaryColumn('uuid')
  userId: string;

  @OneToOne(() => User, (u) => u.credential, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Exclude()
  user: User;

  @Column()
  @Exclude()
  hashedPassword: string;

  @BeforeInsert()
  async hashPassword() {
    this.hashedPassword = await hash(this.hashedPassword, 10);
  }
}
