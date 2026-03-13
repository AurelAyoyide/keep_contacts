import { IsOptional, IsBoolean, IsNumber, Min, IsArray, IsString, ValidateIf } from 'class-validator';

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

  @IsOptional()
  @ValidateIf(o => o.allowedContactIds !== undefined)
  @IsArray({ message: 'allowedContactIds must be an array of contact IDs' })
  @IsString({ each: true })
  allowedContactIds?: string[]; // If provided, only these contacts can be downloaded
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

  @IsOptional()
  @ValidateIf(o => o.allowedContactIds !== undefined)
  @IsArray({ message: 'allowedContactIds must be an array of contact IDs' })
  @IsString({ each: true })
  allowedContactIds?: string[]; // If provided, only these contacts can be downloaded
}
