import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Restaurante } from '../modules/restaurante/entities/restaurante.entity';
import { Categoria } from '../modules/categoria/entities/categoria.entity';
import { Producto } from '../modules/producto/entities/producto.entity';
import { ZonaDomicilio } from '../modules/zona-domicilio/entities/zona-domicilio.entity';
import { Cliente } from '../modules/cliente/entities/cliente.entity';
import { PagoQR } from '../modules/pago/entities/pago-qr.entity';
import { AuditoriaPago } from '../modules/pago/entities/auditoria-pago.entity';
import { Pedido } from '../modules/pedido/entities/pedido.entity';
import { DetallePedido } from '../modules/pedido/entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from '../modules/pedido/entities/historial-estado-pedido.entity';
import { Administrador } from '../modules/auth/entities/administrador.entity';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false, // Necesario para conexiones seguras en la nube como Layerbase
        },
      }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'restaurante_pedidos_db',
      }),
  entities: [
    Restaurante,
    Categoria,
    Producto,
    ZonaDomicilio,
    Cliente,
    PagoQR,
    AuditoriaPago,
    Pedido,
    DetallePedido,
    HistorialEstadoPedido,
    Administrador,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: true, // Evita sincronizaciones automáticas peligrosas en producción
  logging: !isProduction,
});