import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Habilitar CORS sem restrições
  app.enableCors({
    origin: true, // Permite qualquer origem
    methods: '*', // Permite todos os métodos HTTP
    allowedHeaders: '*', // Permite todos os headers
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend rodando na porta ${process.env.PORT ?? 3000}`);
}
bootstrap();
