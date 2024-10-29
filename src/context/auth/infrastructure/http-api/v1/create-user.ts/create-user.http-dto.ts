import { IsNotEmpty, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserHttpDto {
  @ApiProperty({
    description: 'El correo electrónico del nuevo usuario',
    example: 'usuario@ejemplo.com',
    required: true,
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'La contraseña del nuevo usuario (mínimo 8 caracteres)',
    example: 'contraseñaSegura123',
    required: true,
  })
  @Length(8, undefined, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @ApiProperty({
    description: 'El nombre completo del nuevo usuario',
    example: 'Juan Pérez',
    required: true,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;
}
