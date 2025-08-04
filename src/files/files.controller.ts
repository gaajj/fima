import { Controller, Get } from '@nestjs/common';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Get()
  async getAll(): Promise<File[]> {
    return await this.filesService.findAll();
  }
}
