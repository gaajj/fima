import 'dotenv/config';
import dbConfig from '../config/db.config';
import { UserFactory } from './factories/user.factory';
import MainSeeder from './seeds/main.seeder';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { UserCredentialFactory } from './factories/user-credential.factory';
import { UserProfileFactory } from './factories/user-profile.factory';

const options: DataSourceOptions & SeederOptions = {
  ...dbConfig(),
  factories: [UserFactory, UserCredentialFactory, UserProfileFactory],
  seeds: [MainSeeder],
};

const dataSource = new DataSource(options);

dataSource
  .initialize()
  .then(async () => {
    await dataSource.synchronize(true);
    await runSeeders(dataSource);
    console.log('Seeding complete.');
    process.exit();
  })
  .catch((err) => {
    console.log('Seeding failed:', err);
    process.exit(1);
  });
