import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-client-exception.filter';
import { CORS_ORIGINS } from '../src/common/cors';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

let isAppInitialized = false;
let appInstance: any;

async function bootstrap() {
  if (isAppInitialized) {
    return appInstance;
  }
  
  appInstance = await NestFactory.create(AppModule, new ExpressAdapter(server));
  appInstance.setGlobalPrefix('api');

  appInstance.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  appInstance.enableCors({
    origin: CORS_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

  appInstance.useGlobalInterceptors(new TransformInterceptor());

  const { httpAdapter } = appInstance.get(HttpAdapterHost);
  appInstance.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(httpAdapter),
  );

  appInstance.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await appInstance.init();
  isAppInitialized = true;
  return appInstance;
}

// Vercel serverless handler function
export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};
