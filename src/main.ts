import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.API_PORT ? +process.env.API_PORT : 3000;

  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const origins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
    methods:
      process.env.CORS_METHODS ?? 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      process.env.CORS_ALLOWED_HEADERS ??
      'Content-Type,Authorization,Accept,Origin,X-Requested-With',
    exposedHeaders:
      process.env.CORS_EXPOSED_HEADERS ?? 'Content-Length,Content-Range',
    maxAge: 86400,
  });

  await app.listen(port);

  console.log(`API running on: http://localhost:${port}`);
}
void bootstrap();
