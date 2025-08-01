import { User } from '../..//user/entities/user.entity';
import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(User, () => {
  const user = new User();
  user.username = faker.internet.userName();
  user.email = faker.internet.email();
  user.emailVerified = false;
  user.firstName = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.avatarUrl = faker.image.avatar();
  user.hashedPassword = 'pass';

  return user;
});
