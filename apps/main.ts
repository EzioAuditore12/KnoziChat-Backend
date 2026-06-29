import { fastifyMultipart } from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { openApiDocsInit } from './configs/open-api.config';
import { env } from './env';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  await app.register(fastifyMultipart);

  openApiDocsInit(app);

  app.enableCors({ origin: env.CORS_ORIGIN });

  await app.listen(env.PORT, '0.0.0.0');
}
void bootstrap();
