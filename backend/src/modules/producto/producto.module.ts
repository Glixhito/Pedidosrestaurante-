import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ProductoPorcion } from './entities/producto-porcion.entity';
import { ProductoAdicion } from './entities/producto-adicion.entity';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { ProductoGateway } from './producto.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, ProductoPorcion, ProductoAdicion]),
  ],
  providers: [ProductoService, ProductoGateway],
  controllers: [ProductoController],
  exports: [ProductoService],
})
export class ProductoModule {}