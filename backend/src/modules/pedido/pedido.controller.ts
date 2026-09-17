import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { PedidoService } from './pedido.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  /**
   * CREAR PEDIDO (Soporta QR Nequi, Bre-B o Efectivo)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearPedido(@Body() dto: any, @Req() req: Request) {
    const restaurante_id = process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    const cliente_id = dto.cliente_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    return await this.pedidoService.crearPedido(
      restaurante_id,
      cliente_id,
      dto,
      req.ip || '0.0.0.0',
      req.headers['user-agent'] || 'Unknown',
    );
  }

  /**
   * OBTENER LISTA DE PEDIDOS (Panel Administrativo)
   */
  @Get('admin/lista')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerListaAdmin(
    @CurrentUser('restaurante_id') restaurante_id: string,
    @Query('estado') estado?: string,
  ) {
    const idRestaurante = restaurante_id || process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.pedidoService.obtenerPorRestaurante(idRestaurante, estado);
  }

  /**
   * CAMBIAR ESTADO DE UN PEDIDO (Panel Administrativo)
   */
  @Patch('admin/:id/estado')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: string },
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    const idRestaurante = restaurante_id || process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.pedidoService.cambiarEstado(id, idRestaurante, body.estado);
  }

  /**
   * RECHAZAR PEDIDO (Panel Administrativo)
   */
  @Post('admin/:id/rechazar')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async rechazarPedido(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    const idRestaurante = restaurante_id || process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.pedidoService.cambiarEstado(id, idRestaurante, 'RECHAZADO');
  }

  /**
   * CONFIRMAR PAGO EN EFECTIVO (Panel Administrativo)
   */
  @Post('admin/:id/confirmar-pago-efectivo')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async confirmarPagoEfectivo(
    @Param('id') id: string,
    @CurrentUser('restaurante_id') restaurante_id: string,
  ) {
    const idRestaurante = restaurante_id || process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.pedidoService.confirmarPagoEfectivo(id, idRestaurante);
  }

  /**
   * OBTENER PEDIDO POR ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async obtenerPorId(@Param('id') id: string) {
    const restaurante_id = process.env.RESTAURANTE_ID || '9c9a269e-b09a-4c34-ad76-af2fe86ca62c';
    return await this.pedidoService.obtenerPorId(id, restaurante_id);
  }
}