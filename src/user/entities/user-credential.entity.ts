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

@Entity()
export class UserCredential {
  @PrimaryColumn('uuid')
  userId: string;

  @OneToOne(() => User, (u) => u.credential, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  hashedPassword: string;

  @BeforeInsert()
  async hashPassword() {
    this.hashedPassword = await hash(this.hashedPassword, 10);
  }
}
