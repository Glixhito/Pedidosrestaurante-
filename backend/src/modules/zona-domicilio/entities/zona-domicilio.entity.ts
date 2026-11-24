import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';
import { Pedido } from '../../pedido/entities/pedido.entity';

@Entity('zona_domicilio')
@Unique('uq_zona_domicilio_restaurante_nombre', ['restaurante_id', 'nombre'])
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

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Restaurante, (rest) => rest.zonas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  @OneToMany(() => Pedido, (pedido) => pedido.zona)
  pedidos: Pedido[];
}