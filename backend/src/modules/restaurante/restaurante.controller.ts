import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RestauranteService } from './restaurante.service';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('restaurante')
export class RestauranteController {
  constructor(private readonly restauranteService: RestauranteService) {}

  @Post()
  async crear(@Body() dto: CreateRestauranteDto) {
    return await this.restauranteService.crear(dto);
  }

  @Get()
  async obtenerTodos() {
    return await this.restauranteService.obtenerTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.restauranteService.obtenerPorId(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateRestauranteDto,
  ) {
    return await this.restauranteService.actualizar(id, dto);
  }

  @Put(':id/pausar-recepcion')
  @UseGuards(JwtGuard)
  async pausarRecepcion(@Param('id') id: string) {
    return await this.restauranteService.pausarRecepcion(id);
  }
}