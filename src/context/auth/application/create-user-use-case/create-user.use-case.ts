import { HttpStatus, Injectable } from '@nestjs/common';
import { User, PrimitiveUser } from '@/context/auth/domain/user.entity';
import { CreateUserDto } from './create-user.dto';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    dto: CreateUserDto,
  ): Promise<{ data: PrimitiveUser | {}; message: string; statusCode: number }> {
    const user = User.create(dto);
    const response = await this.userRepository.save(user);
    return response;
  }
}
