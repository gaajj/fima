import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { Category } from './categories/entities/category.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(): Promise<File[]> {
    return await this.fileRepo.find({
      relations: ['categories', 'tags', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<File>): Promise<File> {
    const file = this.fileRepo.create(data);
    return this.fileRepo.save(file);
  }

  async addCategory(fileId: string, categoryId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['owner', 'categories'],
    });
    if (!file) {
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    }

    const category = await this.categoryRepo.findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found`);
    }

    if (!file.categories.find((c) => c.id === category.id)) {
      file.categories.push(category);
      await this.fileRepo.save(file);
    }

    return file;
  }
}
