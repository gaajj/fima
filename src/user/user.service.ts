import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, FindOneOptions, Not, Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { UserCredential } from './entities/user-credential.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserRequestDto } from './dto/update-user.request.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profRepo: Repository<UserProfile>,
    private readonly dataSource: DataSource,
  ) {}

  async findByUsername(
    username: string,
    withCredentials: boolean = false,
  ): Promise<User | null> {
    const options: FindOneOptions<User> = {
      where: { username },
      relations: withCredentials ? ['credential'] : [],
    };
    return await this.userRepo.findOne(options);
  }

  async findOne(userId: string): Promise<User | null> {
    const options: FindOneOptions<User> = {
      where: { id: userId },
      relations: ['profile'],
    };
    return await this.userRepo.findOne(options);
  }

  async create(dto: CreateUserRequestDto): Promise<User> {
    const usernameExists = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (usernameExists) {
      throw new BadRequestException(
        `Username '${dto.username}' already exists`,
      );
    }

    const emailExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new BadRequestException(`Email '${dto.email}' already exists`);
    }

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        username: dto.username,
        email: dto.email,
      });
      await manager.save(user);

      await manager.save(
        manager.create(UserCredential, {
          user,
          userId: user.id,
          hashedPassword: dto.password,
        }),
      );

      await manager.save(
        manager.create(UserProfile, {
          user,
          userId: user.id,
        }),
      );

      const findOptions: FindOneOptions<User> = {
        where: { id: user.id },
        relations: ['profile'],
      };
      return manager.findOneOrFail(User, findOptions);
    });
  }

  async update(userId: string, dto: UpdateUserRequestDto): Promise<User | null> {
    const existingUser = await this.findOne(userId);
    if (!existingUser) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    if (dto.username) {
      const conflict = await this.userRepo.findOne({
        where: { username: dto.username, id: Not(userId) },
      });
      if (conflict) {
        throw new BadRequestException(
          `Username '${dto.username}' already exists`,
        );
      }
    }
    if (dto.email) {
      const conflict = await this.userRepo.findOne({
        where: { email: dto.email, id: Not(userId) },
      });
      if (conflict) {
        throw new BadRequestException(`Email '${dto.email}' already exists`);
      }
    }

    const { profile, ...userProps } = dto;
    if (Object.keys(userProps).length) {
      await this.userRepo.update({ id: userId }, userProps);
    }

    if (profile && Object.keys(profile).length) {
      await this.profRepo.update({ userId }, profile);
    }

    return this.findOne(userId);
  }

  async remove(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }
    await this.userRepo.softDelete({ id: userId });
  }
}
