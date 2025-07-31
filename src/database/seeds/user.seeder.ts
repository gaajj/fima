import { User } from '../../user/entities/user.entity';
import { Role } from '../..//user/enums/role.enum';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class UserSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userFactory = factoryManager.get(User);

    await userFactory.saveMany(10);

    const repo = dataSource.getRepository(User);
    const admin = repo.create({
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      hashedPassword: 'pass',
      role: Role.ADMIN,
    });
    await repo.save(admin);
  }
}
