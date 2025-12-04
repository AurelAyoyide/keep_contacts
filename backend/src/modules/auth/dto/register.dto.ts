import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mot de passe minimum 6 caracteres' })
  password: string;
}
