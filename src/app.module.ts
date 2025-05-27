import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/context/auth/infrastructure/auth.module';
import { AuthGuard } from '@/context/shared/guards/auth.guard';
import { PrismaModule } from '@/context/shared/database/prisma.module';
import { ProductsModule } from '@/context/product/infrastructure/products.module';
@Module({
  providers: [AuthGuard],
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    PrismaModule,
    ProductsModule,
  ],
})
export class AppModule {}
