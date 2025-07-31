import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser as CurrentUserType } from '../types/current-user.dto';

export const CurrentUser = createParamDecorator<
  keyof CurrentUserType | undefined,
  ExecutionContext
>((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as CurrentUserType | undefined;

  if (!user) return null;
  return data ? (user as any)[data] : user;
});
