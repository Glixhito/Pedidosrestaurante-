import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { PagoQRService } from './services/pago-qr.service';
import { PedidoService } from '../pedido/pedido.service';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';
import { TipoPagoQR } from './entities/pago-qr.entity';

@Controller('pagos')
export class PagoController {
  constructor(
    private pagoQRService: PagoQRService,
    private pedidoService: PedidoService,
  ) {}

  /**
   * GENERAR QR BRE-B
   */
  @Post('qr/bre-b')
  @HttpCode(HttpStatus.CREATED)
  async generarQRBreB(@Body() data: { pedido_id: string }, @Req() req: Request) {
    // 💡 FIX: Le aseguramos a TypeScript que esto es un string o lanzamos error si falta
    const restaurante_id = process.env.RESTAURANTE_ID;
    if (!restaurante_id) {
      throw new InternalServerErrorException('RESTAURANTE_ID no configurado en el servidor');
    }

    const pedido = await this.pedidoService.obtenerPorId(data.pedido_id, restaurante_id);
    if (!pedido) throw new Error('Pedido no encontrado');

    const pagoQR = await this.pagoQRService.generarQRBreB(
      restaurante_id,
      pedido,
      req.ip || '0.0.0.0',
      req.headers['user-agent'] || 'Unknown',
    );

    return {
      exito: true,
      pago_id: pagoQR.id,
      tipo: TipoPagoQR.BRE_B,
      monto: pagoQR.monto,
      referencia: pagoQR.referencia,
      qr_data: pagoQR.qr_data,
      instrucciones: {
        paso_1: 'Abre tu app bancaria',
        paso_2: 'Escanea este código QR',
        paso_3: 'Confirma la transferencia',
        importante: `Referencia: ${pagoQR.referencia}`,
      },
    };
  }

  /**
   * GENERAR QR NEQUI
   */
  @Post('qr/nequi')
  @HttpCode(HttpStatus.CREATED)
  async generarQRNequi(@Body() data: { pedido_id: string }, @Req() req: Request) {
    // 💡 FIX: Le aseguramos a TypeScript que esto es un string o lanzamos error si falta
    const restaurante_id = process.env.RESTAURANTE_ID;
    if (!restaurante_id) {
      throw new InternalServerErrorException('RESTAURANTE_ID no configurado en el servidor');
    }

    const pedido = await this.pedidoService.obtenerPorId(data.pedido_id, restaurante_id);
    if (!pedido) throw new Error('Pedido no encontrado');

    const pagoQR = await this.pagoQRService.generarQRNequi(
      restaurante_id,
      pedido,
      req.ip || '0.0.0.0',
      req.headers['user-agent'] || 'Unknown',
    );

    return {
      exito: true,
      pago_id: pagoQR.id,
      tipo: TipoPagoQR.NEQUI,
      monto: pagoQR.monto,
      qr_data: pagoQR.qr_data,
      codigo: pagoQR.codigo_nequi,
      instrucciones: {
        paso_1: 'Abre tu app Nequi',
        paso_2: 'Escanea este código QR',
        paso_3: 'Confirma con tu huella',
      },
    };
  }

  /**
   * WEBHOOK NEQUI
   */
  @Post('webhook/nequi')
  @HttpCode(HttpStatus.OK)
  @UseGuards(WebhookSignatureGuard)
  async webhookNequi(@Body() data: any) {
    try {
      await this.pagoQRService.validarPagoNequiWebhook(data);
      return { exito: true, mensaje: 'Pago procesado correctamente' };
    } catch (error: any) {
      console.error('Error en webhook:', error);
      return { exito: false, error: error.message };
    }
  }

  /**
   * CONSULTAR ESTADO
   */
  @Get('estado/:pago_id')
  @HttpCode(HttpStatus.OK)
  async consultarEstado(@Param('pago_id') pago_id: string) {
    const pagoQR = await this.pagoQRService.obtenerEstadoPago(pago_id);

    return {
      pago_id: pagoQR.id,
      estado: pagoQR.estado,
      monto: pagoQR.monto,
      timestamp_creacion: pagoQR.timestamp_creacion,
      timestamp_pago: pagoQR.timestamp_pago,
      mensajes: this.obtenerMensajePorEstado(pagoQR.estado),
    };
  }

  /**
   * REINTENTAR PAGO
   */
  @Post('reintentar/:pago_id')
  @HttpCode(HttpStatus.CREATED)
  async reintentarPago(@Param('pago_id') pago_id: string, @Req() req: Request) {
    const nuevoQR = await this.pagoQRService.reintentarPago(
      pago_id,
      req.ip || '0.0.0.0',
      req.headers['user-agent'] || 'Unknown',
    );

    return {
      exito: true,
      nuevo_pago_id: nuevoQR.id,
      nuevo_qr_data: nuevoQR.qr_data,
      referencia: nuevoQR.referencia,
    };
  }

  /**
   * POLLING MANUAL
   */
  @Post('polling/:pago_id')
  @HttpCode(HttpStatus.OK)
  async hacerPolling(@Param('pago_id') pago_id: string) {
    const resultado = await this.pagoQRService.hacerPollingPago(pago_id);

    if (resultado) {
      return { exito: true, estado: 'PAGADO', mensaje: 'Pago confirmado' };
    }

    return { exito: false, estado: 'ESPERANDO', mensaje: 'Aún esperando pago' };
  }

  private obtenerMensajePorEstado(estado: string): string {
    const mensajes: Record<string, string> = {
      ESPERANDO_PAGO: ' Esperando tu transferencia...',
      VALIDANDO: ' Verificando pago con el banco...',
      PAGADO: ' Pago confirmado! Tu pedido se preparará.',
      ERROR_PAGO: ' No pudimos verificar tu pago.',
      CANCELADO: ' Pago cancelado.',
    };

    return mensajes[estado] || 'Estado desconocido';
  }
}