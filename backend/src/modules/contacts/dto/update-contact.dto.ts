import { IsString, IsOptional, IsEmail, MinLength, Matches, IsISO8601 } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country code must be ISO 2-letter code (e.g., BJ, FR, US)' })
  countryCode?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Date of birth must be valid ISO 8601 date (YYYY-MM-DD)' })
  dateOfBirth?: string | null;

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
