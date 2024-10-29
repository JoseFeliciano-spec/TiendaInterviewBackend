import { Injectable } from '@nestjs/common';
import { User, PrimitiveUser } from '@/context/auth/domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { LoginUserDto } from './login-user.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    dto: LoginUserDto,
  ): Promise<{ message: string; data: string; statusCode: number }> {
    const user = User.login(dto);
    const response = await this.userRepository.login({
      email: user?.toPrimitives().email,
      password: user?.toPrimitives().password,
    });
    return response;
  }
}
