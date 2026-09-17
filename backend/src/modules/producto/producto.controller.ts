import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  ParseBoolPipe,
  SetMetadata,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Decorador para omitir autenticación en caso de habilitar guards globales
export const Public = () => SetMetadata('isPublic', true);

@Controller('productos')
export class ProductoController {
  private readonly defaultRestauranteId =
    process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';

  constructor(private readonly productoService: ProductoService) {}

  // 🔓 RUTA PÚBLICA: Menú principal para clientes
  @Public()
  @Get('menu')
  obtenerMenu() {
    return this.productoService.obtenerPorRestaurante(
      this.defaultRestauranteId,
      true,
    );
  }

  // 🔓 RUTA PÚBLICA: Filtrado por categoría
  @Public()
  @Get('categoria/:categoria_id')
  obtenerPorCategoria(@Param('categoria_id') categoria_id: string) {
    return this.productoService.obtenerPorCategoria(
      categoria_id,
      this.defaultRestauranteId,
    );
  }

  // 🔐 RUTA PROTEGIDA: Crear producto
  @Post()
  @UseGuards(JwtGuard)
  crear(
    @Body() dto: CreateProductoDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return this.productoService.crear(restaurante_id, dto);
  }

  // 🔐 RUTA PROTEGIDA: Panel de administración
  @Get('admin')
  @UseGuards(JwtGuard)
  obtenerTodos(
    @CurrentUser('restaurante_id') restaurante_id: string,
    @Query('activos', new ParseBoolPipe({ optional: true }))
    activos?: boolean,
  ) {
    return this.productoService.obtenerPorRestaurante(
      restaurante_id,
      activos ?? false,
    );
  }

  // 🔐 RUTA PROTEGIDA: Consultar por ID
  @Get(':id')
  @UseGuards(JwtGuard)
  obtenerPorId(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return this.productoService.obtenerPorId(id, restaurante_id);
  }

  // 🔐 RUTA PROTEGIDA: Actualización completa
  @Put(':id')
  @UseGuards(JwtGuard)
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return this.productoService.actualizar(id, restaurante_id, dto);
  }

  // 🔐 RUTA PROTEGIDA: Cambiar estado (activo/inactivo)
  @Put(':id/disponibilidad')
  @UseGuards(JwtGuard)
  toggleDisponibilidad(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return this.productoService.toggleDisponibilidad(id, restaurante_id);
  }

  // 🔐 RUTA PROTEGIDA: Eliminar producto
  @Delete(':id')
  @UseGuards(JwtGuard)
  retirar(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return this.productoService.retirar(id, restaurante_id);
  }
}