import { CreateUserUseCase } from '@/context/auth/application/create-user-use-case/create-user.use-case';
import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { CreateUserHttpDto } from '@/context/auth/infrastructure/http-api/v1/create-user.ts/create-user.http-dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export async function errorResponse(
  createGenericHttpDto: any,
  CreateGenericHttpDto: any,
) {
  const dtoInstance = plainToInstance(
    CreateGenericHttpDto,
    createGenericHttpDto,
  );
  const validationErrors = await validate(dtoInstance);

  if (validationErrors.length > 0) {
    const errorMessages = validationErrors
      .map((error) => Object.values(error.constraints || {}))
      .flat();
    throw new BadRequestException({
      message: 'Errores de validación en los datos proporcionados',
      errors: errorMessages,
    });
  }
}
