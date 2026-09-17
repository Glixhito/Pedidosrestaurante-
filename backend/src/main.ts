// 🇨🇴 Forzar zona horaria de Colombia en Vercel
process.env.TZ = 'America/Bogota';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule, { rawBody: true });

    // Habilitar CORS para permitir solicitudes desde Render y Vercel
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // PIPES DE VALIDACIÓN GLOBAL
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
  
  // 🔄 REESCRITURA DE RUTA PARA CONTROLADORES CON PREFIX 'api/'
  // Permite responder a peticiones que vienen como /auth/login o /api/auth/login
  if (req.url.startsWith('/auth') || req.url.startsWith('/categoria') || req.url.startsWith('/producto')) {
    req.url = `/api${req.url}`;
  }

  instance(req, res);
}