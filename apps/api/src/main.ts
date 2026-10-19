import 'reflect-metadata';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { env } from './env.js';

const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(Logger));
app.use(helmet());
app.enableCors({ origin: env.WEB_ORIGIN, credentials: false });
app.setGlobalPrefix('api');
app.enableVersioning({ type: VersioningType.URI });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
app.enableShutdownHooks();

if (env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder().setTitle('ROUND9 API').setVersion('1').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, config));
}

await app.listen(env.PORT);
