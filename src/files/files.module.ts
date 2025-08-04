import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { FilePermission } from './entities/file-permission.entity';
import { SharedLink } from './entities/shared-link.entity';
import { FileComment } from './entities/file-comment.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

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
  ],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
