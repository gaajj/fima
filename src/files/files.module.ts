import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Category } from './categories/entities/category.entity';
import { FilePermission } from './entities/file-permission.entity';
import { SharedLink } from './entities/shared-link.entity';
import { FileComment } from './entities/file-comment.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { imageFileFilter, multerStorage } from './utils/file-upload.utils';
import { UPLOAD_CONFIG } from './utils/upload.constats';
import { TagsModule } from './tags/tags.module';
import { Tag } from './tags/entities/tag.entity';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    TagsModule,
    CategoriesModule,
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
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
