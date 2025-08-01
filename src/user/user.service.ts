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

  async findOne(userId: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
  }

  async findOneForAuth(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ['refreshTokens'],
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
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

      return m.findOneOrFail(User, {
        where: { id: user.id },
        relations: ['profile'],
      });
    });
  }
}
