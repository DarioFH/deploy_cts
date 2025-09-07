import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrosModule } from './registros/registros.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    RegistrosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
