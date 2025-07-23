import { IsEnum, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { $Enums } from '@prisma/client';

export class UpdateUserRoleDto {
  @IsEnum($Enums.UserRole)
  @IsNotEmpty()
  role: $Enums.UserRole;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updated_by?: number;
}
