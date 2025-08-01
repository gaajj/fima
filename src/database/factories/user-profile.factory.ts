import { UserProfile } from '../../user/entities/user-profile.entity';
import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

export const UserProfileFactory = setSeederFactory(UserProfile, () => {
  const p = new UserProfile();
  p.firstName = faker.person.firstName();
  p.lastName = faker.person.lastName();
  p.avatarUrl = faker.image.avatar();
  return p;
});
