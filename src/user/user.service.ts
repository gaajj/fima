import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserCredential } from './entities/user-credential.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserCredential)
    private readonly credRepo: Repository<UserCredential>,
    @InjectRepository(UserProfile)
    private readonly profRepo: Repository<UserProfile>,
    private readonly dataSource: DataSource,
  ) {}

  async findByUsernameWithCred(username: string) {
    return await this.userRepo.findOne({
      where: { username },
      relations: ['credential'],
    });
  }

  async findOne(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) return null;
    const { profile, ...core } = user;
    return { ...core, ...profile };
  }

  async findOneForAuth(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ['refreshTokens'],
      // relations: ['role', 'refreshTokens'],
    });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.userRepo.exists({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (exists) throw new BadRequestException('Username or email in use.');

    return this.dataSource.transaction(async (m) => {
      const user = m.create(User, { username: dto.username, email: dto.email });
      await m.save(user);

      await m.save(
        m.create(UserCredential, {
          user,
          userId: user.id,
          hashedPassword: dto.password,
        }),
      );

      await m.save(m.create(UserProfile, { user, userId: user.id }));

      return { id: user.id, username: user.username, email: user.email };
    });
  }
}
