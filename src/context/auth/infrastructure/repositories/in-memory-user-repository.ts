import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '@/context/auth/domain/user.repository';
import { Model } from 'mongoose';
import { User } from '@/context/auth/domain/user.entity';
import { UserMongo } from '@/context/auth/infrastructure/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InMemoryUserRepository extends UserRepository {
  @InjectModel(UserMongo.name) private userModel: Model<UserMongo>;

  constructor(private jwtService: JwtService) {
    super();
  }

  async save(user: User): Promise<any> {
    const userUsing = user.toPrimitives();
    const existingUser = await this.userModel.findOne({
      email: userUsing.email,
    });
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(userUsing.password, 10);

    const newUser = new this.userModel({
      ...userUsing,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await newUser.save();

    const payload = { sub: savedUser._id, email: savedUser.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Se ha creado el usuario correctamentsse',
      statusCode: HttpStatus.ACCEPTED,
      data: {
        access_token: token,
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
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválida: El email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } },
    );

    const payload = { sub: user._id, email: user.email };

    return {
      message: 'Se ha iniciado sesión correctamente',
      statusCode: HttpStatus.ACCEPTED,
      data: {
        access_token: await this.jwtService.signAsync(payload),
        id: user._id.toString(),
        email: user.email,
      },
    };
  }
}
