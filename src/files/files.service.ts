import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { Category } from './categories/entities/category.entity';
import { rm } from 'fs/promises';
import { UpdateFileInfoDto } from './dto/update-file-info.dto';
import { Tag } from './tags/entities/tag.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
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

  // Currently can only update the displayName
  // TODO: add way to both create and update full file including categories and tags
  async updateInfo(
    fileId: string,
    dto: UpdateFileInfoDto,
    userId: string,
  ): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['owner', 'categories'],
    });
    if (!file) {
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    }
    if (!file.owner || file.owner.id !== userId) {
      throw new ForbiddenException(`Not authorized to update this file`);
    }

    file.displayName = dto.displayName;
    return this.fileRepo.save(file);
  }

  async remove(fileId: string, userId: string): Promise<void> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['owner'],
    });
    if (!file) {
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    }
    if (!file.owner || file.owner.id !== userId) {
      throw new ForbiddenException(`Not authorized to delete this file`);
    }

    await rm(file.path, { force: true });

    await this.fileRepo.remove(file);
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

  async addTag(fileId: string, tagId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['categories', 'tags', 'owner'],
    });
    if (!file)
      throw new NotFoundException(`File with ID '${fileId}' not found`);

    const tag = await this.tagRepo.findOneBy({ id: tagId });
    if (!tag) throw new NotFoundException(`Tag with ID '${tagId} not found`);

    if (!file.tags.find((t) => t.id === tag.id)) {
      file.tags.push(tag);
      await this.fileRepo.save(file);
    }
    return file;
  }

  async removeTag(fileId: string, tagId: string): Promise<void> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['tags'],
    });
    if (!file)
      throw new NotFoundException(`File with ID '${fileId}' not found`);

    file.tags = file.tags.filter((t) => t.id !== tagId);
    await this.fileRepo.save(file);
  }
}
