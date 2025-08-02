import { Injectable } from '@nestjs/common';
import {
  MailerService as CoreMailerService,
  ISendMailOptions,
} from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly core: CoreMailerService) {}

  send(options: ISendMailOptions) {
    return this.core.sendMail(options);
  }
}
