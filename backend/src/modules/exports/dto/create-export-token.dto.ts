import { IsString, IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';

export class CreateExportTokenDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  expiresInHours?: number = 24;

  @IsOptional()
  @IsString()
  @IsIn(['csv', 'vcf'])
  format?: string = 'csv';
}
