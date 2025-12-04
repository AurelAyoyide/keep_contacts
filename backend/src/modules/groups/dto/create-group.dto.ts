import { IsString, MinLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(2, { message: 'Nom minimum 2 caracteres' })
  name: string;

  @IsString()
  organizationId: string;
}
