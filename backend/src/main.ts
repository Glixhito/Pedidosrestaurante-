// 🇨🇴 Forzar zona horaria de Colombia en todo el servidor
process.env.TZ = 'America/Bogota';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // const configService = app.get(ConfigService); // (Si no lo usas aquí, puedes comentarlo)

  app.use(helmet());
  app.setGlobalPrefix('api');

  // 1. AJUSTE DE CORS:
  // Definimos qué orígenes están permitidos.
  // En local, permitimos localhost. En producción, permitiremos la URL de Vercel.
  const allowedOrigins = [
    'http://localhost:5173', // Puerto típico de Vite (cámbialo si usas otro en local)
    process.env.FRONTEND_URL, // Esta variable la crearemos en Render más adelante
  ].filter(Boolean) as string[]; // Filtra valores indefinidos

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // 2. PUERTO: Render asigna el puerto dinámicamente usando process.env.PORT.
  // Tu código ya lo hace bien, solo asegúrate de que quede así:
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`\n🚀 Servidor ejecutándose en puerto ${port} (Hora sincronizada: Colombia)`);
}
bootstrap();