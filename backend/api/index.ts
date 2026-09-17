// 🇨🇴 Forzar zona horaria de Colombia en Vercel
process.env.TZ = 'America/Bogota';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule, { rawBody: true });

    // 1. Establecer el prefijo global 'api' en NestJS
    app.setGlobalPrefix('api');

    // 2. Habilitar CORS para permitir solicitudes desde Render y Vercel
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

  // 🔄 REESCRITURA AUTOMÁTICA DE RUTAS EN VERCEL
  // Si la petición no empieza con /api, le anteponemos /api para que coincida con setGlobalPrefix
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
}