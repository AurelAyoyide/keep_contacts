import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

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
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
