import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileTypesService } from './file-types.service';
import { FileTypesController } from './file-types.controller';
import { FileType } from './entities/file-type.entity';
import { FileTypeField } from './entities/file-type-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileType, FileTypeField])],
  providers: [FileTypesService],
  controllers: [FileTypesController],
  exports: [FileTypesService],
})
export class FileTypesModule {}
