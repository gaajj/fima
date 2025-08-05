import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { createdByUser: { id: userId } as User },
      order: { name: 'ASC' },
    });
  }

  async create(name: string, userId: string): Promise<Category> {
    const category = this.categoryRepo.create({
      name,
      createdByUser: { id: userId } as User,
    });
    return this.categoryRepo.save(category);
  }
}
