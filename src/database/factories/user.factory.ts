import { User } from '../../user/entities/user.entity';
import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(User, () => {
  const u = new User();
  u.username = faker.internet.userName();
  u.email = faker.internet.email();
  return u;
});
