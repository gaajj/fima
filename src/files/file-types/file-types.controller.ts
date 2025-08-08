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

@Controller('files/types')
export class FileTypesController {
  constructor(private readonly svc: FileTypesService) {}

  @Get()
  async list(): Promise<FileTypeResponseDto[]> {
    const fileTypes = await this.svc.findAll();
    return plainToInstance(FileTypeResponseDto, fileTypes);
  }

  @Post()
  async create(@Body() dto: CreateFileTypeDto): Promise<FileTypeResponseDto> {
    const fileType = await this.svc.create(dto.name, dto.description);
    return plainToInstance(FileTypeResponseDto, fileType);
  }

  @Patch(':id/fields')
  async upsertField(
    @Param('id') typeId: string,
    @Body() dto: UpsertFieldDto,
  ): Promise<FileTypeFieldResponseDto> {
    const fileTypeField = await this.svc.addOrUpdateField(typeId, dto);
    return plainToInstance(FileTypeFieldResponseDto, fileTypeField);
  }

  @Delete(':id/fields/:name')
  async removeField(
    @Param('id') typeId: string,
    @Param('name') name: string,
  ): Promise<void> {
    await this.svc.removeField(typeId, name);
  }
}
