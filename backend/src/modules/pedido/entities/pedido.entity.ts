import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { ZonaDomicilio } from '../../zona-domicilio/entities/zona-domicilio.entity';
import { PagoQR, TipoPagoQR } from '../../pago/entities/pago-qr.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { HistorialEstadoPedido } from './historial-estado-pedido.entity';

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  PREPARANDO = 'PREPARANDO',
  LISTO = 'LISTO',
  ENTREGADO = 'ENTREGADO',
  EN_CAMINO = 'EN_CAMINO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'uuid' })
  cliente_id: string;

  @Column({ type: 'bigint', unique: true })
  numero_pedido: number;

  @Column({ type: 'enum', enum: EstadoPedido, default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Column({ type: 'varchar', length: 500 })
  direccion: string;

  @Column({ type: 'uuid', nullable: true })
  zona_domicilio_id: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referencia: string;

  @Column({ type: 'text', nullable: true })
  instrucciones: string;

  @Column({ type: 'enum', enum: TipoPagoQR, default: TipoPagoQR.EFECTIVO })
  metodo_pago: TipoPagoQR;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tarifa_domicilio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'boolean', default: false })
  pago_efectivo_recibido: boolean;

  @Column({ type: 'boolean', default: false })
  pago_verificado: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razon_rechazo: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Restaurante, (rest) => rest.pedidos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ManyToOne(() => ZonaDomicilio, (zona) => zona.pedidos, { nullable: true })
  @JoinColumn({ name: 'zona_domicilio_id' })
  zona: ZonaDomicilio;

  @OneToOne(() => PagoQR, (pagoQR) => pagoQR.pedido, { nullable: true })
  pago_qr: PagoQR;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: DetallePedido[];

  @OneToMany(() => HistorialEstadoPedido, (historial) => historial.pedido, {
    cascade: true,
  })
  historial: HistorialEstadoPedido[];
}