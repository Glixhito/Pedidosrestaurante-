import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { ZonaDomicilio } from '../../zona-domicilio/entities/zona-domicilio.entity';
import { Pedido } from '../../pedido/entities/pedido.entity';
import { Administrador } from '../../auth/entities/administrador.entity';

@Entity('restaurante')
export class Restaurante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsapp: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  direccion: string;

  @Column({ type: 'boolean', default: true })
  aceptando_pedidos: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Categoria, (cat) => cat.restaurante)
  categorias: Categoria[];

  @OneToMany(() => Producto, (prod) => prod.restaurante)
  productos: Producto[];

  @OneToMany(() => ZonaDomicilio, (zona) => zona.restaurante)
  zonas: ZonaDomicilio[];

  @OneToMany(() => Pedido, (pedido) => pedido.restaurante)
  pedidos: Pedido[];

  @OneToMany(() => Administrador, (admin) => admin.restaurante)
  administradores: Administrador[];
}