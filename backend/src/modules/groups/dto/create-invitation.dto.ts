import { IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiresInHours?: number;
}
