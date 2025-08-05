import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { plainToInstance } from 'class-transformer';
import { FileResponseDto } from './dto/file-response.dto';
import { User } from 'src/user/entities/user.entity';

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
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided or invalid file type');
    }

    const fileUpload = await this.filesService.create({
      path: file.path,
      originalName: file.originalname,
      displayName: file.filename,
      mimeType: file.mimetype,
      size: file.size.toString(),
      owner: { id: userId } as User,
    });
    return plainToInstance(FileResponseDto, fileUpload);
  }
}
