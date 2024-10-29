import {
  Controller,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { GetUserUseCase } from '@/context/auth/application/get-user-use-case/get-user.use-case';
import { AuthGuard } from '@/context/shared/guards/auth.guard';

@Controller('v1/user/me')
export class GetUserController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  @Get()
  @UseGuards(AuthGuard)
  async run(@Request() req) {
    try {
      return await this.getUserUseCase.run({
        userId: req.user.sub, // Obtenemos el userId del request como en tu ejemplo
      });
    } catch (error) {
      throw new UnauthorizedException({
        errors: error.toString(),
        message: 'Error al obtener la información del usuario',
      });
    }
  }
}
