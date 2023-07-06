import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new LoggerMiddleware().use);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
