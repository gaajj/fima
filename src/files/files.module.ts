import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Category } from './categories/entities/category.entity';
import { Tag } from './entities/tag.entity';
import { FilePermission } from './entities/file-permission.entity';
import { SharedLink } from './entities/shared-link.entity';
import { FileComment } from './entities/file-comment.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { imageFileFilter, multerStorage } from './utils/file-upload.utils';
import { UPLOAD_CONFIG } from './utils/upload.constats';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      File,
      Category,
      Tag,
      FilePermission,
      SharedLink,
      FileComment,
    ]),
    MulterModule.register({
      storage: multerStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE },
    }),
  ],
  providers: [FilesService, CategoriesService],
  controllers: [FilesController, CategoriesController],
})
export class FilesModule {}
