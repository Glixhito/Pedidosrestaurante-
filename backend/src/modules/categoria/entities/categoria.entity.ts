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
import { Producto } from '../../producto/entities/producto.entity';

export enum EstadoCategoria {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA',
  RETIRADA = 'RETIRADA',
}

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({
    type: 'enum',
    enum: EstadoCategoria,
    default: EstadoCategoria.ACTIVA,
  })
  estado: EstadoCategoria;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurante, (rest) => rest.categorias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurante_id' })
  restaurante: Restaurante;

  @OneToMany(() => Producto, (prod) => prod.categoria)
  productos: Producto[];
}