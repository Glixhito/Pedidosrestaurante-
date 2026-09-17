import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async obtenerResumen(@CurrentUser('restaurante_id') restaurante_id: string) {
    return await this.dashboardService.obtenerResumen(restaurante_id);
  }
}
