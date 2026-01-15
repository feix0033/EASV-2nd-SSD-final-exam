import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration for all API endpoints
  const config = new DocumentBuilder()
    .setTitle('Agramkow API')
    .setDescription(
      'API documentation for Agramkow transaction tracking and analysis',
    )
    .setVersion('1.0')
    .addTag('transactions')
    .addTag('summation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
