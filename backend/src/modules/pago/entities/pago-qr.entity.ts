import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from '../../pedido/entities/pedido.entity';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';

export enum TipoPagoQR {
  BRE_B = 'BRE_B',
  NEQUI = 'NEQUI',
  EFECTIVO = 'EFECTIVO',
}

export enum EstadoPagoQR {
  ESPERANDO_PAGO = 'ESPERANDO_PAGO',
  VALIDANDO = 'VALIDANDO',
  PAGADO = 'PAGADO',
  ERROR_PAGO = 'ERROR_PAGO',
  CANCELADO = 'CANCELADO',
}

@Entity('pago_qr')
export class PagoQR {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'uuid' })
  pedido_id: string;

  @Column({ type: 'enum', enum: TipoPagoQR })
  tipo_pago: TipoPagoQR;

  @Column({
    type: 'enum',
    enum: EstadoPagoQR,
    default: EstadoPagoQR.ESPERANDO_PAGO,
  })
  estado: EstadoPagoQR;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  referencia: string;

  @Column({ type: 'text' })
  qr_data: string;

  @Column({ type: 'varchar', nullable: true })
  url_qr: string;

  @Column({ type: 'varchar', nullable: true })
  codigo_nequi: string;

  @Column({ type: 'varchar', nullable: true })
  id_transaccion_nequi: string;

  @Column({ type: 'timestamp', nullable: true })
  timestamp_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  timestamp_pago: Date;

  @Column({ type: 'timestamp', nullable: true })
  timestamp_confirmacion: Date;

  @Column({ type: 'int', default: 0 })
  intentos: number;

  @Column({ type: 'simple-array', nullable: true })
  historico_intentos: string[];

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'varchar', nullable: true })
  ip_cliente: string;

  @Column({ type: 'varchar', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  @OneToOne(() => Pedido, (pedido) => pedido.pago_qr, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;
}