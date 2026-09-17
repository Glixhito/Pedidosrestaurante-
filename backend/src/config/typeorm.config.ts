import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { Restaurante } from '../modules/restaurante/entities/restaurante.entity';
import { Categoria } from '../modules/categoria/entities/categoria.entity';
import { Producto } from '../modules/producto/entities/producto.entity';
import { ProductoPorcion } from '../modules/producto/entities/producto-porcion.entity';
import { ProductoAdicion } from '../modules/producto/entities/producto-adicion.entity';
import { ZonaDomicilio } from '../modules/zona-domicilio/entities/zona-domicilio.entity';
import { Cliente } from '../modules/cliente/entities/cliente.entity';
import { PagoQR } from '../modules/pago/entities/pago-qr.entity';
import { AuditoriaPago } from '../modules/pago/entities/auditoria-pago.entity';
import { Pedido } from '../modules/pedido/entities/pedido.entity';
import { DetallePedido } from '../modules/pedido/entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from '../modules/pedido/entities/historial-estado-pedido.entity';
import { Administrador } from '../modules/auth/entities/administrador.entity';

dotenv.config();

// Arreglo global de entidades
const entities = [
  Restaurante,
  Categoria,
  Producto,
  ProductoPorcion,
  ProductoAdicion,
  ZonaDomicilio,
  Cliente,
  PagoQR,
  AuditoriaPago,
  Pedido,
  DetallePedido,
  HistorialEstadoPedido,
  Administrador,
];

// 1. CONFIGURACIÓN PARA NESTJS (Usada por app.module.ts)
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const dbUrl = configService.get<string>('DATABASE_URL_POOLED') || configService.get<string>('DATABASE_URL');
  const enableSsl = isProduction || configService.get<string>('DATABASE_SSL') === 'true';

  return {
    type: 'postgres',
    ...(dbUrl
      ? {
          url: dbUrl,
          ssl: enableSsl ? { rejectUnauthorized: false } : false,
        }
      : {
          host: configService.get<string>('DATABASE_HOST') || 'localhost',
          port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
          username: configService.get<string>('DATABASE_USER') || 'postgres',
          password: configService.get<string>('DATABASE_PASSWORD') || 'postgres',
          database: configService.get<string>('DATABASE_NAME') || 'restaurante_pedidos_db',
          ssl: enableSsl ? { rejectUnauthorized: false } : false,
        }),
    entities,
    synchronize: true,
    logging: !isProduction,
  };
};

// 2. CONFIGURACIÓN PARA TYPEORM CLI Y MIGRACIONES
const isProductionDS = process.env.NODE_ENV === 'production';
const dbUrlDS = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
const enableSslDS = isProductionDS || process.env.DATABASE_SSL === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(dbUrlDS
    ? {
        url: dbUrlDS,
        ssl: enableSslDS ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'restaurante_pedidos_db',
        ssl: enableSslDS ? { rejectUnauthorized: false } : false,
      }),
  entities,
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: !isProductionDS,
});