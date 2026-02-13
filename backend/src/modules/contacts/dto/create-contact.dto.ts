import { IsString, IsOptional, IsEmail, MinLength, Matches, IsISO8601 } from 'class-validator';

export class CreateContactDto {
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Prenom requis' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Nom requis' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Telephone invalide' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country code must be ISO 2-letter code (e.g., BJ, FR, US)' })
  countryCode?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Date of birth must be valid ISO 8601 date (YYYY-MM-DD)' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  // Professional fields
  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  // Location fields
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
