import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async updateHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ) {
    return await this.userRepo.update(
      { id: userId },
      { refreshToken: hashedRefreshToken },
    );
  }

  async findByUsername(username: string) {
    return await this.userRepo.findOne({
      where: { username },
    });
  }

  async findOne(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      select: [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'avatarUrl',
        'role',
      ],
    });
  }

  async findOneForAuth(userId: string) {
    return this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'role', 'refreshToken'],
    });
  }
}
