import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeSQLite } from './utils/sql-lite/sql.lite';
import * as Database from 'better-sqlite3';

export let db: Database.Database;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  db = initializeSQLite();
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Orchestrator API')
    .setDescription('The Orchestrator API description')
    .setVersion('1.0')
    .addTag('orchestrator')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}

bootstrap();