import { Role } from '../../user/enums/role.enum';

export type CurrentUser = {
  id: string;
  role: Role;
  sid?: string;
};
