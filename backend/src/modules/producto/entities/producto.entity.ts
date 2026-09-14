import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany, 
} from 'typeorm';
import { Restaurante } from '../../restaurante/entities/restaurante.entity';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { DetallePedido } from '../../pedido/entities/detalle-pedido.entity';
import { ProductoPorcion } from './producto-porcion.entity'; 
import { ProductoAdicion } from './producto-adicion.entity';

export enum EstadoProducto {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  RETIRADO = 'RETIRADO',
}

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  restaurante_id: string;

  @Column({ type: 'uuid' })
  categoria_id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagen_url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number;

  @Column({ type: 'boolean', default: true })
  disponible: boolean;

  @Column({
    type: 'enum',
    enum: EstadoProducto,
    default: EstadoProducto.ACTIVO,
  })
  estado: EstadoProducto;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Restaurante, (rest) => rest.productos, {
    onDelete: 'CASCADE',
  })
  restaurante: Restaurante;

  @ManyToOne(() => Categoria, (cat) => cat.productos, {
    onDelete: 'RESTRICT',
  })
  categoria: Categoria;

  @OneToMany(() => DetallePedido, (det) => det.producto)
  detalles: DetallePedido[];

  // 🥩 RELACIÓN DE GRAMAJES
  @OneToMany(() => ProductoPorcion, (porcion) => porcion.producto, {
    cascade: true,
    eager: true,
  })
  porciones: ProductoPorcion[];

  // 🧀 RELACIÓN DE ADICIONES / TOPPINGS
  @OneToMany(() => ProductoAdicion, (adicion) => adicion.producto, {
    cascade: true,
    eager: true,
  })
  adiciones: ProductoAdicion[];
}