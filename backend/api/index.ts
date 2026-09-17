// 🇨🇴 Forzar zona horaria de Colombia en Vercel
process.env.TZ = 'America/Bogota';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule, { rawBody: true });

    // 1. Establecer el prefijo 'api' nativo en NestJS
    app.setGlobalPrefix('api');

    // 2. Habilitar CORS para el frontend
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // 3. Validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    await app.init();
  }

  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
}