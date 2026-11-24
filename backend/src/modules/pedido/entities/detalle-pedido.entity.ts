import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { ProductoPorcion } from '../../producto/entities/producto-porcion.entity';

@Entity('detalle_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  pedido_id: string;

  @Index()
  @Column({ type: 'uuid' })
  producto_id: string;

  @Column({ type: 'uuid', nullable: true })
  producto_porcion_id: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario_en_momento: number;

  @Column({ type: 'jsonb', nullable: true })
  adiciones_seleccionadas: Array<{
    id?: string;
    nombre: string;
    precio: number;
  }>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.detalles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => ProductoPorcion, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'producto_porcion_id' })
  productoPorcion: ProductoPorcion;

  get subtotal(): number {
    const precioBase = Number(this.precio_unitario_en_momento) || 0;

    const totalAdiciones = Array.isArray(this.adiciones_seleccionadas)
      ? this.adiciones_seleccionadas.reduce(
          (sum, ad) => sum + (Number(ad.precio) || 0),
          0,
        )
      : 0;

    return (precioBase + totalAdiciones) * this.cantidad;
  }
}