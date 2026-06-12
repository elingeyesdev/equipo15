import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { CORS_ORIGINS } from './common/cors';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Forzar redirección HTTPS en producción
  app.use((req: any, res: any, next: any) => {
    if (process.env.NODE_ENV === 'production') {
      if (
        req.headers['x-forwarded-proto'] &&
        req.headers['x-forwarded-proto'] !== 'https'
      ) {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
    }
    next();
  });

  app.use(helmet());

  app.enableCors({
    origin: CORS_ORIGINS,
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

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Pista 8 API')
      .setDescription('API documentation for Pista 8 project')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
