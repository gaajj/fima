import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileType } from './entities/file-type.entity';
import { Repository } from 'typeorm';
import { FileTypeField } from './entities/file-type-field.entity';
import { FieldKind } from './entities/field-kind.entity';

@Injectable()
export class FileTypesService {
  constructor(
    @InjectRepository(FileType)
    private readonly typeRepo: Repository<FileType>,
    @InjectRepository(FileTypeField)
    private readonly fieldRepo: Repository<FileTypeField>,
  ) {}

  async findAll() {
    return await this.typeRepo.find({ relations: ['fields'] });
  }

  async findOneOrFail(id: string): Promise<FileType> {
    const type = await this.typeRepo.findOne({
      where: { id },
      relations: ['fields'],
    });
    if (!type)
      throw new NotFoundException(`File type with ID '${id}' not found`);
    return type;
  }

  async create(name: string, description?: string): Promise<FileType> {
    const exists = await this.typeRepo.findOne({ where: { name } });
    if (exists) {
      throw new BadRequestException(`File type '${name}' already exists`);
    }

    const type = this.typeRepo.create({
      name,
      description,
    });
    return this.typeRepo.save(type);
  }

  async addOrUpdateField(
    typeId: string,
    dto: Partial<FileTypeField>,
  ): Promise<FileTypeField> {
    const type = await this.typeRepo.findOne({ where: { id: typeId } });
    if (!type) {
      throw new NotFoundException(`File type '${type}' not found`);
    }

    let field = await this.fieldRepo.findOne({
      where: {
        type: { id: typeId },
        name: dto.name,
      },
    });
    if (!field) {
      field = this.fieldRepo.create({ type, ...dto });
    } else {
      Object.assign(field, dto);
    }

    return this.fieldRepo.save(field);
  }

  async removeField(typeId: string, fieldName: string) {
    const field = await this.fieldRepo.findOne({
      where: {
        type: { id: typeId },
        name: fieldName,
      },
    });
    if (!field) {
      return;
    }
    await this.fieldRepo.remove(field);
  }

  async getJsonSchema(typeId: string) {
    const type = await this.findOneOrFail(typeId);

    const schema: any = {
      type: 'object',
      properties: {},
      required: [] as string[],
    };

    for (const f of type.fields ?? []) {
      schema.properties[f.name] = this.mapFieldToSchema(f);
      if (f.required) schema.required.push(f.name);
    }
    return schema;
  }

  private mapFieldToSchema(f: FileTypeField) {
    const c = f.constraints ?? {};
    switch (f.kind) {
      case 'string': {
        const allowed = this.pick(c, [
          'minLength',
          'maxLength',
          'pattern',
          'format',
        ]);
        return { type: 'string', ...allowed };
      }
      case 'number': {
        const allowed = this.pick(c, [
          'minimum',
          'maximum',
          'exclusiveMinimum',
          'exclusiveMaximum',
          'multipleOf',
        ]);
        return { type: 'number', ...allowed };
      }
      case 'boolean':
        return { type: 'boolean' };

      case 'date':
        // represent dates as ISO strings
        return { type: 'string', format: 'date-time' };

      case 'enum': {
        // map custom "options" => JSON Schema "enum"
        const { options, ...rest } = c;
        const allowedRest = {}; // nothing else special for enum
        return options
          ? { type: 'string', enum: options, ...allowedRest }
          : { type: 'string' };
      }

      case 'array': {
        // custom: itemKind + itemConstraints
        const itemKind = c.itemKind as FieldKind | undefined;
        const itemConstraints = (c.itemConstraints ?? {}) as Record<
          string,
          any
        >;
        let items: any = {};
        if (itemKind) {
          // Reuse mapper for inner type, but ignore "required" on inner
          items = this.mapFieldToSchema({
            ...f,
            kind: itemKind,
            constraints: itemConstraints,
          } as FileTypeField);
        }
        const allowed = this.pick(c, ['minItems', 'maxItems', 'uniqueItems']);
        return { type: 'array', items, ...allowed };
      }

      case 'object': {
        // keep it simple unless you want nested custom fields
        const allowed = this.pick(c, [
          'properties',
          'required',
          'additionalProperties',
        ]);
        return { type: 'object', ...allowed };
      }

      default:
        // fallback (shouldn’t happen)
        return {};
    }
  }

  private pick<T extends object>(obj: T, keys: readonly (keyof T)[]) {
    const out: Partial<T> = {};
    for (const k of keys) if (k in obj) (out as any)[k] = (obj as any)[k];
    return out;
  }
}
