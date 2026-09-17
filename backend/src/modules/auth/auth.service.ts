import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Administrador } from './entities/administrador.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Administrador)
    private readonly adminRepository: Repository<Administrador>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    const existe = await this.adminRepository.findOne({
      where: { email: dto.email },
    });

    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = this.adminRepository.create({
      email: dto.email,
      password_hash: hashedPassword,
      nombre: dto.nombre,
      restaurante_id: dto.restaurante_id,
    });

    await this.adminRepository.save(admin);

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      restaurante_id: admin.restaurante_id,
    });

    return { access_token: token };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const cleanEmail = dto.email ? dto.email.trim().toLowerCase() : '';
    console.log('👉 [AUTH] Intento de login recibido para:', cleanEmail);

    const admin = await this.adminRepository.findOne({
      where: { email: cleanEmail },
    });

    if (!admin) {
      console.log('❌ [AUTH] Usuario NO encontrado en la BD:', cleanEmail);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✅ [AUTH] Usuario encontrado en BD:', admin.email);
    console.log('🔒 [AUTH] Hash almacenado en BD:', admin.password_hash);

    const passwordValida = await bcrypt.compare(
      dto.password,
      admin.password_hash,
    );

    console.log('🔑 [AUTH] Resultado comparacion Bcrypt:', passwordValida);

    if (!passwordValida) {
      console.log('❌ [AUTH] Contraseña incorrecta para:', cleanEmail);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    admin.last_login = new Date();
    await this.adminRepository.save(admin);

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      restaurante_id: admin.restaurante_id,
    });

    return { access_token: token };
  }
}