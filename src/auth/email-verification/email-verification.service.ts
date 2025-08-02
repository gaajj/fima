import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { Repository } from 'typeorm';
import { MailerService } from 'src/mailer/mailer.service';
import { User } from 'src/user/entities/user.entity';
import { randomBytes } from 'crypto';
import { compare, hash } from 'bcrypt';

@Injectable()
export class EmailVerificationService {
  private readonly ttlHours = 24;

  constructor(
    @InjectRepository(EmailVerification)
    private readonly evRepo: Repository<EmailVerification>,
    private readonly mailer: MailerService,
  ) {}

  async sendVerificationEmail(user: User) {
    const raw = randomBytes(32).toString('hex');
    const hashed = await hash(raw, 10);

    const verification = await this.evRepo.save(
      this.evRepo.create({
        user,
        hashedToken: hashed,
        expiresAt: new Date(Date.now() + this.ttlHours * 3600_000),
      }),
    );

    const url = `${process.env.BASE_URL}/auth/email/verify?id=${verification.id}&token=${raw}`;

    await this.mailer.send({
      to: user.email,
      subject: 'Verify your e-mail address',
      template: 'verify-email',
      context: { username: user.username, url },
    });
  }

  async verify(id: string, token: string) {
    const record = await this.evRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (
      !record ||
      record.consumed ||
      record.expiresAt < new Date() ||
      !(await compare(token, record.hashedToken))
    ) {
      throw new BadRequestException('Verification link is invalid or expired');
    }

    record.consumed = true;
    record.user.emailVerified = true;
    await this.evRepo.manager.transaction(async (m) => {
      await m.save(record);
      await m.save(record.user);
    });

    return { message: 'Email successfully verified.' };
  }
}
