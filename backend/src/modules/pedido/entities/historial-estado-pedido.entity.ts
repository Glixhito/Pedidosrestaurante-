import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';

export enum EstadoPedidoEnum {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  PREPARANDO = 'PREPARANDO',
  LISTO = 'LISTO',
  EN_CAMINO = 'EN_CAMINO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('historial_estado_pedido')
export class HistorialEstadoPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pedido_id: string;

  @Column({ type: 'varchar', nullable: true })
  estado_anterior: string;

  @Column({ type: 'varchar' })
  estado_nuevo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razon_cambio: string;

  @Column({ type: 'uuid', nullable: true })
  admin_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Pedido, (pedido) => pedido.historial, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;
}