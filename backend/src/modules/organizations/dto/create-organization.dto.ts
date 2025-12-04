import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2, { message: 'Nom minimum 2 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  autoTag?: string;
}
