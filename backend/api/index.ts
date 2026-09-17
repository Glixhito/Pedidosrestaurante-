import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Habilitar CORS para el frontend
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Descomenta la siguiente línea SI tu backend usa prefijo /api
    // app.setGlobalPrefix('api');

    await app.init();
  }
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
}