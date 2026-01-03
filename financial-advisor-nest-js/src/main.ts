import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration for all API endpoints
  const config = new DocumentBuilder()
    .setTitle('Financial Advisor API')
    .setDescription(
      'API documentation for personal finance tracking and summation features',
    )
    .setVersion('1.0')
    .addTag('financial-transactions')
    .addTag('summation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
