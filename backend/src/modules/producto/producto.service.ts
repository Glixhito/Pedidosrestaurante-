import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Producto, EstadoProducto } from './entities/producto.entity';
import { ProductoPorcion } from './entities/producto-porcion.entity';
import { ProductoAdicion } from './entities/producto-adicion.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductoGateway } from './producto.gateway';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(ProductoPorcion)
    private readonly porcionRepository: Repository<ProductoPorcion>,
    @InjectRepository(ProductoAdicion)
    private readonly adicionRepository: Repository<ProductoAdicion>,
    private readonly productoGateway: ProductoGateway,
  ) {}

  async crear(
    restaurante_id: string,
    dto: CreateProductoDto,
  ): Promise<Producto> {
    const existe = await this.productoRepository.findOne({
      where: { restaurante_id, nombre: dto.nombre, deleted_at: IsNull() },
    });

    if (existe) {
      throw new BadRequestException('Ya existe un producto con este nombre');
    }

    const rawDto = dto as any;

    // Parseo robusto
    let arrPorciones = rawDto.porciones || rawDto.gramajes || [];
    if (typeof arrPorciones === 'string') {
      try { arrPorciones = JSON.parse(arrPorciones); } catch (e) { arrPorciones = []; }
    }
    
    let arrAdiciones = rawDto.adiciones || rawDto.toppings || rawDto.extras || [];
    if (typeof arrAdiciones === 'string') {
      try { arrAdiciones = JSON.parse(arrAdiciones); } catch (e) { arrAdiciones = []; }
    }

    const { porciones, adiciones, toppings, gramajes, extras, ...restoDto } = rawDto;

    // 1. Creamos y guardamos el producto base
    const producto = this.productoRepository.create({
      ...restoDto,
      restaurante_id,
      disponible: true,
      estado: EstadoProducto.ACTIVO,
    });

    const productoGuardado: any = await this.productoRepository.save(producto);
    const productoId = productoGuardado.id;

    // 2. Guardar porciones (Blindaje de Relación TypeORM + as any)
    if (Array.isArray(arrPorciones) && arrPorciones.length > 0) {
      for (const pDto of arrPorciones) {
        if (!pDto.gramos) continue;
        const nuevaPorcion = this.porcionRepository.create({
          producto: { id: productoId }, 
          producto_id: productoId,      
          productoId: productoId,       
          gramos: Number(pDto.gramos) || 0,
          precio: Number(pDto.precio) || 0,
        } as any); // 👈 Fix TypeScript
        await this.porcionRepository.save(nuevaPorcion);
      }
    }

    // 3. Guardar adiciones 🧀 (Blindaje de Relación TypeORM + as any)
    if (Array.isArray(arrAdiciones) && arrAdiciones.length > 0) {
      for (const aDto of arrAdiciones) {
        if (!aDto.nombre) continue;
        const nuevaAdicion = this.adicionRepository.create({
          producto: { id: productoId }, 
          producto_id: productoId,      
          productoId: productoId,       
          nombre: String(aDto.nombre).trim(),
          precio: Number(aDto.precio) || 0,
        } as any); // 👈 Fix TypeScript
        await this.adicionRepository.save(nuevaAdicion);
      }
    }

    this.productoGateway.notificarCambioMenu();
    return await this.obtenerPorId(productoId, restaurante_id);
  }

  async obtenerPorRestaurante(
    restaurante_id: string,
    soloActivos: boolean = true,
  ): Promise<Producto[]> {
    const query = this.productoRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.porciones', 'porciones')
      .leftJoinAndSelect('p.adiciones', 'adiciones')
      .where('p.restaurante_id = :restaurante_id', { restaurante_id })
      .andWhere('p.deleted_at IS NULL');

    if (soloActivos) {
      query
        .andWhere('p.disponible = true')
        .andWhere('p.estado = :estado', { estado: EstadoProducto.ACTIVO });
    }

    return await query.orderBy('p.nombre', 'ASC').getMany();
  }

  async obtenerPorCategoria(
    categoria_id: string,
    restaurante_id: string,
  ): Promise<Producto[]> {
    return await this.productoRepository.find({
      where: {
        categoria_id,
        restaurante_id,
        disponible: true,
        estado: EstadoProducto.ACTIVO,
        deleted_at: IsNull(),
      },
      relations: ['porciones', 'adiciones'],
      order: { nombre: 'ASC' },
    });
  }

  async obtenerPorId(
    id: string,
    restaurante_id: string,
  ): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id, restaurante_id, deleted_at: IsNull() },
      relations: ['categoria', 'porciones', 'adiciones'],
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async actualizar(
    id: string,
    restaurante_id: string,
    dto: UpdateProductoDto,
  ): Promise<Producto> {
    await this.obtenerPorId(id, restaurante_id);
    const rawDto = dto as any;

    let arrPorciones = rawDto.porciones || rawDto.gramajes;
    if (typeof arrPorciones === 'string') {
      try { arrPorciones = JSON.parse(arrPorciones); } catch (e) { arrPorciones = undefined; }
    }

    let arrAdiciones = rawDto.adiciones || rawDto.toppings || rawDto.extras;
    if (typeof arrAdiciones === 'string') {
      try { arrAdiciones = JSON.parse(arrAdiciones); } catch (e) { arrAdiciones = undefined; }
    }

    // Sincronización manual y segura de porciones
    if (arrPorciones && Array.isArray(arrPorciones)) {
      const porcionesActuales = await this.porcionRepository.find({ where: { producto: { id } } as any });
      const idsEnDto = arrPorciones.filter((p: any) => p.id).map((p: any) => p.id);

      for (const pDto of arrPorciones) {
        if (!pDto.gramos) continue;
        if (pDto.id) {
          await this.porcionRepository.update(pDto.id, {
            gramos: Number(pDto.gramos) || 0,
            precio: Number(pDto.precio) || 0,
          });
        } else {
          const nuevaPorcion = this.porcionRepository.create({
            producto: { id },
            producto_id: id,
            productoId: id,
            gramos: Number(pDto.gramos) || 0,
            precio: Number(pDto.precio) || 0,
          } as any); // 👈 Fix TypeScript
          await this.porcionRepository.save(nuevaPorcion);
        }
      }

      for (const porcionActual of porcionesActuales) {
        if (!idsEnDto.includes(porcionActual.id)) {
          try { await this.porcionRepository.delete(porcionActual.id); } catch (e) {}
        }
      }
    }

    // Sincronización manual y segura de adiciones 🧀
    if (arrAdiciones && Array.isArray(arrAdiciones)) {
      const adicionesActuales = await this.adicionRepository.find({ where: { producto: { id } } as any });
      const idsAdicionesEnDto = arrAdiciones.filter((a: any) => a.id).map((a: any) => a.id);

      for (const aDto of arrAdiciones) {
        if (!aDto.nombre) continue;
        if (aDto.id) {
          await this.adicionRepository.update(aDto.id, {
            nombre: String(aDto.nombre).trim(),
            precio: Number(aDto.precio) || 0,
          });
        } else {
          const nuevaAdicion = this.adicionRepository.create({
            producto: { id },
            producto_id: id,
            productoId: id,
            nombre: String(aDto.nombre).trim(),
            precio: Number(aDto.precio) || 0,
          } as any); // 👈 Fix TypeScript
          await this.adicionRepository.save(nuevaAdicion);
        }
      }

      for (const adicionActual of adicionesActuales) {
        if (!idsAdicionesEnDto.includes(adicionActual.id)) {
          try { await this.adicionRepository.delete(adicionActual.id); } catch (e) {}
        }
      }
    }

    const { porciones, adiciones, toppings, gramajes, extras, ...restoDto } = rawDto;
    
    if (Object.keys(restoDto).length > 0) {
      await this.productoRepository.update(id, restoDto);
    }

    this.productoGateway.notificarCambioMenu();
    return await this.obtenerPorId(id, restaurante_id);
  }

  async toggleDisponibilidad(
    id: string,
    restaurante_id: string,
  ): Promise<Producto> {
    const producto = await this.obtenerPorId(id, restaurante_id);
    producto.disponible = !producto.disponible;
    const actualizado = await this.productoRepository.save(producto);
    this.productoGateway.notificarCambioMenu();
    return actualizado;
  }

  async retirar(id: string, restaurante_id: string): Promise<Producto> {
    const producto = await this.obtenerPorId(id, restaurante_id);
    producto.estado = EstadoProducto.RETIRADO;
    producto.deleted_at = new Date();
    const retirado = await this.productoRepository.save(producto);
    this.productoGateway.notificarCambioMenu();
    return retirado;
  }

  async verificarDisponibilidad(productIds: string[]): Promise<string[]> {
    const productos = await this.productoRepository
      .createQueryBuilder('p')
      .whereInIds(productIds)
      .andWhere('p.disponible = false')
      .select(['p.id', 'p.nombre'])
      .getMany();
    return productos.map((p) => p.id);
  }
}