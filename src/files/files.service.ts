import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { rm } from 'fs/promises';
import { UpdateFileInfoDto } from './dto/update-file-info.dto';
import { Tag } from './tags/entities/tag.entity';
import { FileType } from './file-types/entities/file-type.entity';
import Ajv from 'ajv';
import { FileTypesService } from './file-types/file-types.service';

const ajv = new Ajv({ allErrors: true });

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    private readonly fileTypesService: FileTypesService,
  ) {}

  async findAll(): Promise<File[]> {
    return await this.fileRepo.find({
      relations: ['type', 'tags', 'owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<File>): Promise<File> {
    const file = this.fileRepo.create({ metadata: {}, ...data });
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
      relations: ['owner'],
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

  async setType(fileId: string, typeId: string, userId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['owner', 'type'],
    });
    if (!file)
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    if (!file.owner || file.owner.id !== userId)
      throw new ForbiddenException(`Not authorized`);

    const type = await this.fileTypesService.findOneOrFail(typeId);

    file.type = type;
    file.metadata = {};
    return this.fileRepo.save(file);
  }

  async updateMetadata(
    fileId: string,
    metadata: Record<string, any>,
    userId: string,
  ): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['owner', 'type'],
    });
    if (!file)
      throw new NotFoundException(`File with ID '${fileId}' not found`);
    if (!file.owner || file.owner.id !== userId)
      throw new ForbiddenException(`Not authorized`);
    if (!file.type) throw new BadRequestException('File has no type set');

    const schema = await this.fileTypesService.getJsonSchema(file.type.id);
    const validate = ajv.compile(schema);

    if (!validate(metadata)) {
      throw new BadRequestException({
        message: 'Invalid metadata',
        details: validate.errors,
      });
    }

    file.metadata = metadata;
    return this.fileRepo.save(file);
  }

  async addTag(fileId: string, tagId: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { id: fileId },
      relations: ['tags', 'owner'],
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
