import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
  ) {}

  async findAll(): Promise<File[]> {
    return await this.fileRepo.find({
      relations: ['categories', 'tags', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }
}
