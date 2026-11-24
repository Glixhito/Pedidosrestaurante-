import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';
import { Pedido } from '../../pedido/entities/pedido.entity';

@Entity('zona_domicilio')
export class ZonaDomicilio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tarifa: number;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurante, (rest) => rest.zonas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  @OneToMany(() => Pedido, (pedido) => pedido.zona)
  pedidos: Pedido[];
}