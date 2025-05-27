import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '@/context/auth/domain/user.repository';
import { User } from '@/context/auth/domain/user.entity';
import { PrismaService } from '@/context/shared/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class InMemoryUserRepository extends UserRepository {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async getUserFromToken(token: string): Promise<any> {
    try {
      console.log(token);
      const user = await this.prisma.user.findUnique({ 
        where: { id: token } 
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return {
        message: 'Usuario encontrado correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async save(user: User): Promise<any> {
    const userUsing = user.toPrimitives();
    
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userUsing.email },
    });

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(userUsing.password, 10);

    const savedUser = await this.prisma.user.create({
      data: {
        name: userUsing.name,
        email: userUsing.email,
        password: hashedPassword,
      },
    });

    const payload = { sub: savedUser.id, email: savedUser.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Se ha creado el usuario correctamente',
      statusCode: HttpStatus.ACCEPTED,
      data: {
        access_token: token,
        id: savedUser.id.toString(),
        name: savedUser.name,
        email: savedUser.email,
      },
    };
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<any> {
    const user = await this.prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválida: El email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = { sub: user.id, email: user.email };

    return {
      message: 'Se ha iniciado sesión correctamente',
      statusCode: HttpStatus.OK,
      data: {
        access_token: await this.jwtService.signAsync(payload),
        id: user.id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }
}
