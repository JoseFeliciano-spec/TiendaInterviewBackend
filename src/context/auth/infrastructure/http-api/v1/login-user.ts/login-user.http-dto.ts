import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class LoginUserHttpDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @Length(8, undefined, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
