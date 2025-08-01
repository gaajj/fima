import { UserCredential } from '../../user/entities/user-credential.entity';
import { setSeederFactory } from 'typeorm-extension';

export const UserCredentialFactory = setSeederFactory(UserCredential, () => {
  const c = new UserCredential();
  c.hashedPassword = 'password';
  return c;
});
