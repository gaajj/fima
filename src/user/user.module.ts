import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserCredential } from './entities/user-credential.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Session } from './entities/session.entity';
import { EmailVerificationModule } from 'src/auth/email-verification/email-verification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserCredential, Session, UserProfile]),
    EmailVerificationModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
