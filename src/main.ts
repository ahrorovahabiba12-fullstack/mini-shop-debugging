import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true
  }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.APP_PORT;
  await app.listen(port);

  console.log(`Server is running on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
