import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Not, Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { User } from 'src/user/entities/user.entity';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  findAll(userId: string): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { createdByUser: { id: userId } },
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateTagDto, userId: string): Promise<Tag> {
    const exists = await this.tagRepo.findOne({
      where: {
        name: dto.name,
        createdByUser: { id: userId },
      },
    });
    if (exists)
      throw new BadRequestException(`Tag '${dto.name}' aldready exists`);

    const tag = this.tagRepo.create({
      name: dto.name,
      createdByUser: { id: userId } as User,
    });
    return this.tagRepo.save(tag);
  }

  async update(tagId: string, dto: UpdateTagDto, userId: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({
      where: {
        id: tagId,
        createdByUser: { id: userId },
      },
    });
    if (!tag) throw new NotFoundException(`Tag with ID '${tagId}' not found`);

    if (dto.name) {
      const conflict = await this.tagRepo.findOne({
        where: {
          name: dto.name,
          createdByUser: { id: userId },
          id: Not(tagId),
        },
      });
      if (conflict)
        throw new BadRequestException(`Tag '${dto.name}' already exists`);
    }

    tag.name = dto.name!;
    return this.tagRepo.save(tag);
  }

  async remove(tagId: string, userId: string): Promise<void> {
    const tag = await this.tagRepo.findOne({
      where: {
        id: tagId,
        createdByUser: { id: userId },
      },
    });
    if (!tag) throw new NotFoundException(`Tag with ID '${tagId}' not found`);
    await this.tagRepo.softRemove(tag);
  }
}
