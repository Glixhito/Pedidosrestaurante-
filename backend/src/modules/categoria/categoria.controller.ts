import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get('cliente')
  async obtenerParaCliente() {
    const restaurante_id = process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.categoriaService.obtenerPorRestaurante(restaurante_id);
  }

  @Post()
  @UseGuards(JwtGuard)
  async crear(
    @Body() dto: CreateCategoriaDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.categoriaService.crear(restaurante_id, dto);
  }

  @Get('admin')
  @UseGuards(JwtGuard)
  async obtenerTodas(
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.categoriaService.obtenerTodas(restaurante_id);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async obtenerPorId(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.categoriaService.obtenerPorId(id, restaurante_id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateCategoriaDto,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.categoriaService.actualizar(id, restaurante_id, dto);
  }

  @Put(':id/desactivar')
  @UseGuards(JwtGuard)
  async desactivar(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.categoriaService.desactivar(id, restaurante_id);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async retirar(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    return await this.categoriaService.retirar(id, restaurante_id);
  }
}