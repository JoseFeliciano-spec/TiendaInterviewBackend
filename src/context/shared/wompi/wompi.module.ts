import { Module } from '@nestjs/common';
import { WompiService } from './wompi.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, // ✅ CLAVE: Importar ConfigModule según search result
  ],
  providers: [WompiService],
  exports: [WompiService],
})
export class WompiModule {}
