import { registerAs } from '@nestjs/config';

export default registerAs('emailVerification', () => ({
  ttlHours: +process.env.EMAIL_VERIFICATION_TTL_HOURS!,
  baseUrl: process.env.EMAIL_VERIFICATION_BASE_URL,
  tokenBytes: +process.env.EMAIL_VERIFICATION_TOKEN_BYTES!,
}));
