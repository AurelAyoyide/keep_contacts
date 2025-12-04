import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nom minimum 2 caracteres' })
  name?: string;
}
