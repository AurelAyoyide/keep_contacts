import { IsOptional, IsBoolean, IsNumber, Min, IsArray, IsString } from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiresInHours?: number;

  @IsOptional()
  @IsArray({ message: 'requiredFields must be an array of field names' })
  @IsString({ each: true })
  requiredFields?: string[]; // e.g., ['firstName', 'lastName', 'phone', 'email']
  // Valid fields: firstName, lastName, phone, email, dateOfBirth, nickname, tag
}

export class UpdateInvitationDto {
  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiresInHours?: number;

  @IsOptional()
  @IsArray({ message: 'requiredFields must be an array of field names' })
  @IsString({ each: true })
  requiredFields?: string[]; // e.g., ['firstName', 'lastName', 'phone', 'email']
}
