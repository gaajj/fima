import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Not, Repository } from 'typeorm';
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
    const exists = await this.categoryRepo.findOne({
      where: {
        name,
        createdByUser: { id: userId } as User,
      },
    });
    if (exists) {
      throw new BadRequestException(`Category '${name}' already exists`);
    }

    const category = this.categoryRepo.create({
      name,
      createdByUser: { id: userId } as User,
    });
    return this.categoryRepo.save(category);
  }

  async update(
    categoryId: string,
    categoryName: string,
    userId: string,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, createdByUser: { id: userId } as User },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found`);
    }

    const conflict = await this.categoryRepo.findOne({
      where: {
        name: categoryName,
        createdByUser: { id: userId } as User,
        id: Not(categoryId),
      },
    });
    if (conflict) {
      throw new BadRequestException(
        `Category '${categoryName}' already exists`,
      );
    }

    category.name = categoryName;
    return this.categoryRepo.save(category);
  }
}
