import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { LoginUserUseCase } from '@/context/auth/application/login-user-use-case/login-user.use-case';
import { LoginUserHttpDto } from '@/context/auth/infrastructure/http-api/v1/login-user.ts/login-user.http-dto';
import { errorResponse } from '@/context/shared/response/ErrorsResponse';

@Controller('v1/user/login')
export class LoginUserController {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Iniciar sesión de usuario',
    description:
      'Permite iniciar sesión con correo electrónico y contraseña válidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        data: {
          access_token: 'jwt-token-example',
        },
        message: 'Inicio de sesión exitoso',
        statusCode: 200,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas',
    schema: {
      $ref: getSchemaPath(LoginUserHttpDto), // Referencia al DTO
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en el proceso de inicio de sesión',
    schema: {
      example: {
        errors: 'Error específico del proceso',
        message:
          'Hubo un error al iniciar sesión. Por favor, inténtelo nuevamente.',
        statusCode: 400,
      },
    },
  })
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
