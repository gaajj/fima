import { User } from '../../user/entities/user.entity';
import { Role } from '../..//user/enums/role.enum';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserCredential } from '../../user/entities/user-credential.entity';
import { UserProfile } from '../../user/entities/user-profile.entity';

export default class UserSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const userFactory = factoryManager.get(User);
    const credFactory = factoryManager.get(UserCredential);
    const profFactory = factoryManager.get(UserProfile);

    const users = await userFactory.saveMany(10);

    for (const u of users) {
      await credFactory.save({ user: u, userId: u.id });
      await profFactory.save({ user: u, userId: u.id });
    }

    const userRepo = dataSource.getRepository(User);
    const admin = userRepo.create({
      username: 'admin',
      email: 'admin@example.com',
      role: Role.ADMIN,
      credential: {
        hashedPassword: 'password',
      },
      profile: {
        firstName: 'Admin',
      },
    });
    await userRepo.save(admin);
  }
}
