import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: [Role, ...Role[]]) =>
  SetMetadata(ROLES_KEY, roles);
