import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { File } from '../entities/file.entity';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { AclEntry } from '../entities/acl-entry.entity';
import { AuthorizationModule } from 'src/auth/authorization.module';

@Module({
  imports: [
    AuthorizationModule,
    TypeOrmModule.forFeature([Folder, File, AclEntry]),
  ],
  providers: [FoldersService],
  controllers: [FoldersController],
  exports: [FoldersService],
})
export class FoldersModule {}
