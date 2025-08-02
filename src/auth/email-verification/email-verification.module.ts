import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { MailerModule } from 'src/mailer/mailer.module';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { ConfigModule } from '@nestjs/config';
import emailVerificationConfig from './config/email-verification.config';

@Module({
  imports: [
    MailerModule,
    TypeOrmModule.forFeature([EmailVerification]),
    ConfigModule.forFeature(emailVerificationConfig),
  ],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
