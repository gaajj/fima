import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FileTypesService } from './file-types.service';
import { CreateFileTypeDto } from './dto/create-file-type.dto';
import { FileTypeResponseDto } from './dto/file-type-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpsertFieldDto } from './dto/upsert-field.dto';
import { FileTypeFieldResponseDto } from './dto/file-type-field-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/user/enums/role.enum';

@Controller('files/types')
export class FileTypesController {
  constructor(private readonly svc: FileTypesService) {}

  @Get()
  async getAll(): Promise<FileTypeResponseDto[]> {
    const fileTypes = await this.svc.findAll();
    return plainToInstance(FileTypeResponseDto, fileTypes);
  }

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateFileTypeDto): Promise<FileTypeResponseDto> {
    const fileType = await this.svc.create(dto.name, dto.description);
    return plainToInstance(FileTypeResponseDto, fileType);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/fields')
  async upsertField(
    @Param('id') typeId: string,
    @Body() dto: UpsertFieldDto,
  ): Promise<FileTypeFieldResponseDto> {
    const fileTypeField = await this.svc.addOrUpdateField(typeId, dto);
    return plainToInstance(FileTypeFieldResponseDto, fileTypeField);
  }

  @Roles(Role.ADMIN)
  @Delete(':id/fields/:name')
  async removeField(
    @Param('id') typeId: string,
    @Param('name') name: string,
  ): Promise<void> {
    await this.svc.removeField(typeId, name);
  }
}
