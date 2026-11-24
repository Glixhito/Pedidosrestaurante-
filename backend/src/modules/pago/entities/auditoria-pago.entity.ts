import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PagoQR } from './pago-qr.entity';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';

export enum AccionAuditoria {
  QR_CREADO = 'QR_CREADO',
  PAGO_DETECTADO = 'PAGO_DETECTADO',
  VALIDACION_EXITOSA = 'VALIDACION_EXITOSA',
  VALIDACION_FALLIDA = 'VALIDACION_FALLIDA',
  PAGO_CONFIRMADO = 'PAGO_CONFIRMADO',
  WEBHOOK_RECIBIDO = 'WEBHOOK_RECIBIDO',
  POLLING_EJECUTADO = 'POLLING_EJECUTADO',
  ERROR_SISTEMA = 'ERROR_SISTEMA',
  REINTENTAR = 'REINTENTAR',
}

@Entity('auditoria_pago')
export class AuditoriaPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'uuid' })
  pago_qr_id: string;

  @Column({ type: 'enum', enum: AccionAuditoria })
  accion: AccionAuditoria;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto: number;

  @Column({ type: 'varchar', nullable: true })
  referencia: string;

  @Column({ type: 'text', nullable: true })
  detalles: string;

  @Column({ type: 'varchar', nullable: true })
  ip: string;

  @Column({ type: 'varchar', nullable: true })
  user_agent: string;

  @Column({ type: 'boolean', default: false })
  exitoso: boolean;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Restaurante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  @ManyToOne(() => PagoQR, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pago_qr_id' })
  pago_qr: PagoQR;
}