import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
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

type EnvGetter = (key: string) => string | undefined;

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

// Única fuente de la configuración de conexión, usada por NestJS, CLI y seeds
const buildConnection = (get: EnvGetter): DataSourceOptions => {
  const isProduction = get('NODE_ENV') === 'production';
  const useSsl = isProduction || get('DATABASE_SSL') === 'true';

  // La URL solo se usa en producción. En local siempre se usan las variables
  // individuales, para que nunca se conecte a la base real por accidente.
  const url = isProduction
    ? get('DATABASE_URL_POOLED') || get('DATABASE_URL')
    : undefined;

  // Si se define el certificado de Layer Base, se verifica la conexión.
  // Sin certificado, se cifra pero no se verifica el servidor.
  const caPem = get('DATABASE_SSL_CA');
  const ssl = useSsl
    ? caPem
      ? { ca: caPem.replace(/\\n/g, '\n'), rejectUnauthorized: true }
      : { rejectUnauthorized: false }
    : false;

  const base = {
    type: 'postgres' as const,
    entities,
    migrations: [isProduction ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
    synchronize: false,
    migrationsRun: false,
    logging: !isProduction,
    ssl,
  };

  if (url) {
    return { ...base, url };
  }

  return {
    ...base,
    host: get('DATABASE_HOST') || 'localhost',
    port: parseInt(get('DATABASE_PORT') || '5432', 10),
    username: get('DATABASE_USER') || 'postgres',
    password: get('DATABASE_PASSWORD') || 'postgres',
    database: get('DATABASE_NAME') || 'restaurante_pedidos_db',
  };
};

// 1. Para NestJS (app.module.ts)
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions =>
  buildConnection((key) => configService.get<string>(key));

// 2. Para TypeORM CLI, seeds y migraciones
export const AppDataSource = new DataSource(
  buildConnection((key) => process.env[key]),
);