import { User } from '@/context/auth/domain/user.entity';

export abstract class UserRepository {
  abstract save(user: User): Promise<any>;
  abstract getUserFromToken(id: string): Promise<any>;
  abstract login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<any>;
}
