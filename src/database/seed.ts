import 'dotenv/config';
import dbConfig from '../config/db.config';
import { UserFactory } from './factories/user.factory';
import MainSeeder from './seeds/main.seeder';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';

const options: DataSourceOptions & SeederOptions = {
  ...dbConfig(),
  factories: [UserFactory],
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
