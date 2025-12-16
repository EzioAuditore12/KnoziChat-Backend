import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { apiReference } from '@scalar/nestjs-api-reference';

const openApiConfig = new DocumentBuilder()
  .setTitle('KnoziChat')
  .setDescription('The api documentation for KnoziChat Backend')
  .setVersion('1.0.0')
  .build();

export function openApiDocsInit(app: NestFastifyApplication) {
  const document = SwaggerModule.createDocument(app, openApiConfig);

  app.use(
    '/api',
    apiReference({
      content: document,
      theme: 'bluePlanet',
      withFastify: true,
    }),
  );
}
