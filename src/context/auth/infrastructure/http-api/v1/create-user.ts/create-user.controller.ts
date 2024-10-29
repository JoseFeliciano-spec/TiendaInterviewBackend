import { CreateUserUseCase } from '@/context/auth/application/create-user-use-case/create-user.use-case';
import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { CreateUserHttpDto } from '@/context/auth/infrastructure/http-api/v1/create-user.ts/create-user.http-dto';
import { errorResponse } from '@/context/shared/response/ErrorsResponse';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@Controller('v1/user/register')
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema validando los datos de entrada',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        data: {
          id: 'uuid-example',
          email: 'john.doe@example.com',
          name: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: 'Usuario creado exitosamente',
        statusCode: 201,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error en la creación del usuario',
    schema: {
      example: {
        errors: 'Error específico del proceso',
        message:
          'Hubo un error al crear el usuario. Por favor, inténtalo nuevamente.',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación de datos',
    schema: {
      example: {
        errors: [
          {
            field: 'email',
            message: 'El email debe ser una dirección válida',
          },
          {
            field: 'name',
            message: 'El nombre es requerido',
          },
          {
            field: 'password',
            message: 'La contraseña debe tener al menos 6 caracteres',
          },
        ],
        message: 'Error de validación',
        statusCode: 400,
      },
    },
  })
  async run(@Body() createUserHttpDto: CreateUserHttpDto) {
    await errorResponse(createUserHttpDto, CreateUserHttpDto);

    try {
      return await this.createUserUseCase.run({
        email: createUserHttpDto.email,
        name: createUserHttpDto.name,
        password: createUserHttpDto.password,
      });
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al crear el usuario. Por favor, inténtalo nuevamente.',
      });
    }
  }
}
