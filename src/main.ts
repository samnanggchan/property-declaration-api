import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parser so HttpOnly cookies are parsed into req.cookies
  app.use(cookieParser());

  // Allow the Next.js admin frontend to call this API with HttpOnly cookies
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Serve uploads directory statically at /uploads
  const express = await import('express');
  const path = await import('path');
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Validate and transform request bodies via DTOs
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Set the global API prefix and version 🚀
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  console.log(`Property declaration API is running on port ${port}`);
}
void bootstrap();
