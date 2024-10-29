import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserUseCase } from '@/context/auth/application/login-user-use-case/login-user.use-case';
import { LoginUserHttpDto } from '@/context/auth/infrastructure/http-api/v1/login-user.ts/login-user.http-dto';
import { errorResponse } from '@/context/shared/response/ErrorsResponse';

@Controller('v1/user/login')
export class LoginUserController {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {}

  @Post()
  async run(@Body() loginUserHttpDto: LoginUserHttpDto) {
    await errorResponse(loginUserHttpDto, LoginUserHttpDto);

    try {
      return await this.loginUserUseCase.run({
        email: loginUserHttpDto.email,
        password: loginUserHttpDto.password,
      });
    } catch (error) {
      throw error instanceof UnauthorizedException
        ? new UnauthorizedException({
            errors: error.toString(),
            message:
              'Credenciales inválidas. Verifique su correo electrónico y contraseña.',
          })
        : new BadRequestException({
            errors: error.toString(),
            message:
              'Hubo un error al iniciar sesión. Por favor, inténtelo nuevamente.',
          });
    }
  }
}
