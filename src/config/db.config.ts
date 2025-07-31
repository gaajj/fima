import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as path from 'path';
import { registerAs } from '@nestjs/config';

export default registerAs('dbconfig.dev', (): PostgresConnectionOptions => {
  return {
    url: process.env.DB_URL,
    type: 'postgres',
    port: process.env.DB_PORT ? +process.env.DB_PORT : 9999,
    entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
    synchronize: true,
    ssl: true,
  };
});
