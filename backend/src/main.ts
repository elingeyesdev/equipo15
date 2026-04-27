import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(helmet());

  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      'https://pista8-f8e6e.web.app',
      'https://pista8.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(httpAdapter),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
