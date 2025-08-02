import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { EmailVerificationService } from './email-verification.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Public()
@Controller('auth/email')
export class EmailVerificationController {
  constructor(private readonly evService: EmailVerificationService) {}

  @Get('verify')
  verify(@Query() dto: VerifyEmailDto) {
    return this.evService.verify(dto.id, dto.token);
  }
}
