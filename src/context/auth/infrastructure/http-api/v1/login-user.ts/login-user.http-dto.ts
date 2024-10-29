import { IsNotEmpty, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserHttpDto {
  @ApiProperty({
    description: 'El correo electrónico del usuario que intenta iniciar sesión',
    example: 'usuario@ejemplo.com',
    required: true,
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'La contraseña del usuario (mínimo 8 caracteres)',
    example: 'contraseñaSegura123',
    required: true,
  })
  @Length(8, undefined, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
