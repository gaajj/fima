import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { SharedLink } from './entities/shared-link.entity';
import { FileComment } from './entities/file-comment.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { anyFileFilter, multerStorage } from './utils/file-upload.utils';
import { TagsModule } from './tags/tags.module';
import { Tag } from './tags/entities/tag.entity';
import { FileTypesModule } from './file-types/file-types.module';
import { FoldersModule } from './folders/folders.module';
import { Folder } from './folders/entities/folder.entity';
import { UPLOAD_CONFIG } from './utils/upload.constants';
import { AclEntry } from './entities/acl-entry.entity';
import { AuthorizationModule } from 'src/auth/authorization.module';

@Module({
  imports: [
    TagsModule,
    FileTypesModule,
    FoldersModule,
    AuthorizationModule,
    TypeOrmModule.forFeature([
      File,
      Tag,
      AclEntry,
      SharedLink,
      FileComment,
      Folder,
    ]),
    MulterModule.register({
      storage: multerStorage,
      fileFilter: anyFileFilter,
      limits: { fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE },
    }),
  ],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
