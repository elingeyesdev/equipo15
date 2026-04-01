import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log("ue42FM0pORPEeNGw:", process.env.MONGODB_URI);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'firebase-admin.json'), 'utf8'),
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Pista 8 API')
    .setDescription('API documentation for Pista 8 project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
