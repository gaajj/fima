import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AclEntry } from 'src/files/entities/acl-entry.entity';
import { File } from 'src/files/entities/file.entity';
import { Folder } from 'src/files/folders/entities/folder.entity';
import { AuthorizationService } from './authorization.service';

@Module({
  imports: [TypeOrmModule.forFeature([AclEntry, File, Folder])],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
