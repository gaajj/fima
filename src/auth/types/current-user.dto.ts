import { Role } from 'src/user/enums/role.enum';

export type CurrentUser = {
  id: string;
  role: Role;
};
