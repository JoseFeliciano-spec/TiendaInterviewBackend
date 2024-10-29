import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '@/context/auth/domain/user.repository';

interface GetUserUseCaseParams {
  userId: string;
}

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run({ userId }: GetUserUseCaseParams) {
    try {
      const response = await this.userRepository.getUserFromToken(userId);
      return response;
    } catch (error) {
      throw new UnauthorizedException('Error al obtener el usuario');
    }
  }
}
