import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { EmailVerificationService } from './email-verification.service';
import { VerifyEmailRequestDto } from './dto/verify-email.request.dto';

@Public()
@Controller('auth/email')
export class EmailVerificationController {
  constructor(private readonly evService: EmailVerificationService) {}

  @Get('verify')
  verify(@Query() dto: VerifyEmailRequestDto) {
    return this.evService.verify(dto.id, dto.token);
  }
}
