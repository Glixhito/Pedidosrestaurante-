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
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get('menu')
  async obtenerMenu() {
    // ID real de tu base de datos
    const restaurante_id = process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.productoService.obtenerPorRestaurante(restaurante_id, true);
  }

  @Get('categoria/:categoria_id')
  async obtenerPorCategoria(
    @Param('categoria_id') categoria_id: string,
  ) {
    // ID real de tu base de datos
    const restaurante_id = process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.productoService.obtenerPorCategoria(
      categoria_id,
      restaurante_id,
    );
  }

  @Post()
  @UseGuards(JwtGuard)
  async crear(
    @Body() dto: CreateProductoDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.productoService.crear(restaurante_id, dto);
  }

  @Get('admin')
  @UseGuards(JwtGuard)
  async obtenerTodos(
    @CurrentUser('restaurante_id') restaurante_id: string,
    @Query('activos') activos: boolean = false,
  ) {
    return await this.productoService.obtenerPorRestaurante(
      restaurante_id,
      activos,
    );
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async obtenerPorId(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.productoService.obtenerPorId(id, restaurante_id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.productoService.actualizar(id, restaurante_id, dto);
  }

  @Put(':id/disponibilidad')
  @UseGuards(JwtGuard)
  async toggleDisponibilidad(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.productoService.toggleDisponibilidad(id, restaurante_id);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async retirar(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.productoService.retirar(id, restaurante_id);
  }
}