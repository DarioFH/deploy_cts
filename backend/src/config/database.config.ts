import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password123',
  database: 'app_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Apenas para desenvolvimento
  logging: true,
};
