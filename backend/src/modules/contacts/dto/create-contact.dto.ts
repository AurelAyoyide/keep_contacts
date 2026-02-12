import { IsString, IsOptional, IsEmail, MinLength, Matches, IsISO8601 } from 'class-validator';

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
  @MinLength(5, { message: 'Telephone invalide' })
  phone: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country code must be ISO 2-letter code (e.g., BJ, FR, US)' })
  countryCode?: string; // ISO 2-letter code like 'BJ' for Benin, 'FR' for France

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Date of birth must be valid ISO 8601 date (YYYY-MM-DD)' })
  dateOfBirth?: string; // ISO 8601 format: YYYY-MM-DD

  @IsOptional()
  @IsString()
  tag?: string;
}
