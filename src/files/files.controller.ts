import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { Public } from 'src/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { FileResponseDto } from './dto/file-response.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Get()
  async getAll(): Promise<FileResponseDto[]> {
    const files = await this.filesService.findAll();
    return plainToInstance(FileResponseDto, files);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ): Promise<File> {
    if (!file)
      throw new BadRequestException('No file provided or invalid file type.');

    const { path, originalname, filename, mimetype, size } = file;
    return this.filesService.create({
      path,
      originalName: originalname,
      displayName: filename,
      mimeType: mimetype,
      size: size.toString(),
      owner: { id: userId } as any,
    });
  }
}
