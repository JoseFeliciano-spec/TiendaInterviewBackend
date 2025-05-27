import { Module } from '@nestjs/common';
import { CreateUserController } from '@/context/auth/infrastructure/http-api/v1/create-user.ts/create-user.controller';
import { InMemoryUserRepository } from '@/context/auth/infrastructure/repositories/in-memory-user-repository';
import { UserRepository } from '@/context/auth/domain/user.repository';
import { CreateUserUseCase } from '@/context/auth/application/create-user-use-case/create-user.use-case';
import { LoginUserController } from './http-api/v1/login-user.ts/login-user.controller';
import { LoginUserUseCase } from '../application/login-user-use-case/login-user.use-case';
import { GetUserController } from './http-api/v1/get-user.ts/get-user.controller';
import { GetUserUseCase } from '../application/get-user-use-case/get-user.use-case';
import { PrismaModule } from '@/context/shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CreateUserController, LoginUserController, GetUserController],
  providers: [
    CreateUserUseCase,
    LoginUserUseCase,
    GetUserUseCase,
    InMemoryUserRepository,
    {
      provide: UserRepository,
      useExisting: InMemoryUserRepository,
    },
  ],
  exports: [CreateUserUseCase, LoginUserUseCase, GetUserUseCase],
})
export class AuthModule {}
