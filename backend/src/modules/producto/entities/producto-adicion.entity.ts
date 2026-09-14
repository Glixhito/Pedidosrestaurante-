import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Producto } from './producto.entity';

@Entity('adicion')
export class ProductoAdicion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @ManyToOne(() => Producto, (producto) => producto.adiciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ name: 'producto_id' })
  productoId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}