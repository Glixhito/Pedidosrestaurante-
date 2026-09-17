import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn, // 👈 Agregar import
} from 'typeorm';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';

@Entity('administrador')
export class Administrador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurante, (rest) => rest.administradores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurante_id' }) // 👈 Especificar el nombre exacto de la columna en BD
  restaurante: Restaurante;
}