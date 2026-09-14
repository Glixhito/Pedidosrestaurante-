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
      where: {
        restaurante_id,
        nombre: dto.nombre,
        deleted_at: IsNull(),
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe un producto con este nombre',
      );
    }

    // Extraemos porciones y adiciones del DTO
    const { porciones, adiciones, ...restoDto } = dto as any;

    // 1. Creamos y guardamos el producto base (con cast explícito a Producto)
    const producto = this.productoRepository.create({
      ...restoDto,
      restaurante_id,
      disponible: true,
      estado: EstadoProducto.ACTIVO,
    });

    const productoGuardado: any = await this.productoRepository.save(producto);
    const productoId = productoGuardado.id;

    // 2. Guardar porciones si existen
    if (porciones && Array.isArray(porciones) && porciones.length > 0) {
      for (const pDto of porciones) {
        const nuevaPorcion = this.porcionRepository.create({
          productoId,
          gramos: Number(pDto.gramos),
          precio: Number(pDto.precio),
        });
        await this.porcionRepository.save(nuevaPorcion);
      }
    }

    // 3. Guardar adiciones si existen 🧀
    if (adiciones && Array.isArray(adiciones) && adiciones.length > 0) {
      for (const aDto of adiciones) {
        const nuevaAdicion = this.adicionRepository.create({
          productoId,
          nombre: aDto.nombre,
          precio: Number(aDto.precio),
        });
        await this.adicionRepository.save(nuevaAdicion);
      }
    }

    this.productoGateway.notificarCambioMenu();

    // 4. Retornamos el producto completo con sus relaciones cargadas
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
    // 1. Verificar que el producto exista
    await this.obtenerPorId(id, restaurante_id);

    // 2. Sincronización manual y segura de porciones
    if (dto.porciones) {
      const porcionesDto = dto.porciones as any[];
      const porcionesActuales = await this.porcionRepository.find({ where: { productoId: id } });
      const idsEnDto = porcionesDto.filter((p) => p.id).map((p) => p.id);

      for (const pDto of porcionesDto) {
        if (pDto.id) {
          await this.porcionRepository.update(pDto.id, {
            productoId: id,
            gramos: Number(pDto.gramos),
            precio: Number(pDto.precio),
          });
        } else {
          const nuevaPorcion = this.porcionRepository.create({
            productoId: id,
            gramos: Number(pDto.gramos),
            precio: Number(pDto.precio),
          });
          await this.porcionRepository.save(nuevaPorcion);
        }
      }

      for (const porcionActual of porcionesActuales) {
        if (!idsEnDto.includes(porcionActual.id)) {
          try {
            await this.porcionRepository.delete(porcionActual.id);
          } catch (error) {
            console.warn(`No se pudo eliminar la porción ${porcionActual.id} porque tiene historial en pedidos.`);
          }
        }
      }
      delete dto.porciones;
    }

    // 3. Sincronización manual y segura de adiciones 🧀
    if (dto.adiciones) {
      const adicionesDto = dto.adiciones as any[];
      const adicionesActuales = await this.adicionRepository.find({ where: { productoId: id } });
      const idsAdicionesEnDto = adicionesDto.filter((a) => a.id).map((a) => a.id);

      for (const aDto of adicionesDto) {
        if (aDto.id) {
          await this.adicionRepository.update(aDto.id, {
            productoId: id,
            nombre: aDto.nombre,
            precio: Number(aDto.precio),
          });
        } else {
          const nuevaAdicion = this.adicionRepository.create({
            productoId: id,
            nombre: aDto.nombre,
            precio: Number(aDto.precio),
          });
          await this.adicionRepository.save(nuevaAdicion);
        }
      }

      for (const adicionActual of adicionesActuales) {
        if (!idsAdicionesEnDto.includes(adicionActual.id)) {
          try {
            await this.adicionRepository.delete(adicionActual.id);
          } catch (error) {
            console.warn(`No se pudo eliminar la adición ${adicionActual.id} porque tiene historial en pedidos.`);
          }
        }
      }
      delete dto.adiciones;
    }

    // 4. Actualizar campos generales (nombre, precio, imagen)
    if (Object.keys(dto).length > 0) {
      await this.productoRepository.update(id, dto);
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