import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const limit = process.env.MAX_BODY_SIZE || '50mb';
  app.use(json({ limit }));
  app.use(urlencoded({ extended: true, limit }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port as number);
  Logger.log(`API escuchando en http://0.0.0.0:${port}`);
}
bootstrap();
