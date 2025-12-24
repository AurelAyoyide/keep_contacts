import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  slug: string;

  @IsString()
  @MinLength(1, { message: 'Prenom requis' })
  firstName: string;

  @IsString()
  @MinLength(1, { message: 'Nom requis' })
  lastName: string;

  @IsString()
  @MinLength(6, { message: 'Telephone invalide' })
  phone: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
