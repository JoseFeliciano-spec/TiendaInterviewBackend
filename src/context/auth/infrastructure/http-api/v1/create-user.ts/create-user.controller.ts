import { CreateUserUseCase } from '@/context/auth/application/create-user-use-case/create-user.use-case';
import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { CreateUserHttpDto } from '@/context/auth/infrastructure/http-api/v1/create-user.ts/create-user.http-dto';
import { errorResponse } from '@/context/shared/response/ErrorsResponse';

@Controller('v1/user/register')
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
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
