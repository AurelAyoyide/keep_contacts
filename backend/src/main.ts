import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isDev = process.env.NODE_ENV !== 'production';

  // Security headers — relax cross-origin policies in dev to allow phone access
  app.use(
    helmet({
      crossOriginResourcePolicy: isDev ? false : { policy: 'same-origin' },
      crossOriginOpenerPolicy: isDev ? false : { policy: 'same-origin' },
      crossOriginEmbedderPolicy: false, // Keep false: breaks some APIs otherwise
    }),
  );

  // CORS: in dev, allow any origin so the local network phone can connect
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: isDev
      ? true // allow all origins in development
      : frontendUrl || false,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}

bootstrap();
