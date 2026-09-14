import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Restaurante } from '../modules/restaurante/entities/restaurante.entity';
import { Categoria } from '../modules/categoria/entities/categoria.entity';
import { Producto } from '../modules/producto/entities/producto.entity';
import { ProductoPorcion } from '../modules/producto/entities/producto-porcion.entity';
import { ProductoAdicion } from '../modules/producto/entities/producto-adicion.entity'; // 🧀 1. IMPORTAR LA ENTIDAD AQUÍ
import { ZonaDomicilio } from '../modules/zona-domicilio/entities/zona-domicilio.entity';
import { Cliente } from '../modules/cliente/entities/cliente.entity';
import { PagoQR } from '../modules/pago/entities/pago-qr.entity';
import { AuditoriaPago } from '../modules/pago/entities/auditoria-pago.entity';
import { Pedido } from '../modules/pedido/entities/pedido.entity';
import { DetallePedido } from '../modules/pedido/entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from '../modules/pedido/entities/historial-estado-pedido.entity';
import { Administrador } from '../modules/auth/entities/administrador.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get('DATABASE_URL_POOLED') || configService.get('DATABASE_URL'),
  entities: [
    Restaurante,
    Categoria,
    Producto,
    ProductoPorcion,
    ProductoAdicion, // 🧀 2. AGREGARLA AL ARREGLO GLOBAL DE ENTIDADES
    ZonaDomicilio,
    Cliente,
    PagoQR,      
    AuditoriaPago, 
    Pedido,
    DetallePedido,
    HistorialEstadoPedido,
    Administrador,
  ],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: {
    rejectUnauthorized: false, // 👈 Obligatorio para establecer la conexión segura con Neon
  },
});