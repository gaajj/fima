import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { Repository } from 'typeorm';
import { MailerService } from 'src/mailer/mailer.service';
import { User } from 'src/user/entities/user.entity';
import { createHash, randomBytes } from 'crypto';
import emailVerificationConfig from './config/email-verification.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly evRepo: Repository<EmailVerification>,
    @Inject(emailVerificationConfig.KEY)
    private readonly cfg: ConfigType<typeof emailVerificationConfig>,
    private readonly mailer: MailerService,
  ) {}

  async sendVerificationEmail(user: User): Promise<void> {
    const rawToken = this.createRawToken();
    const expiresAt = new Date(Date.now() + this.cfg.ttlHours * 3600_000);

    const verification = this.evRepo.create({
      user,
      hashedToken: this.hash(rawToken),
      expiresAt,
    });
    await this.evRepo.save(verification);

    await this.mailer.send({
      to: user.email,
      subject: 'Verify your e-mail address',
      template: 'verify-email',
      context: {
        username: user.username,
        url: this.buildUrl(verification.id, rawToken),
      },
    });
  }

  async verify(id: string, token: string) {
    const record = await this.evRepo.findOne({
      where: { id },
      relations: ['user'],
      withDeleted: false,
    });

    if (!record) throw new BadRequestException('Link invalid.');
    if (this.hash(token) !== record.hashedToken)
      throw new BadRequestException('Link invalid.');
    if (record.verifiedAt) throw new BadRequestException('Link already used.');
    if (record.expiresAt < new Date())
      throw new BadRequestException('Link expired.');

    record.verifiedAt = new Date();
    record.expired = true;
    record.user.emailVerified = true;

    await this.evRepo.manager.transaction(async (m) => {
      await m.save(record);
      await m.save(record.user);
    });
  }

  private createRawToken(): string {
    return randomBytes(this.cfg.tokenBytes).toString('hex');
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildUrl(id: string, token: string): string {
    return `${this.cfg.baseUrl}/auth/email/verify?id=${id}&token=${token}`;
  }
}
