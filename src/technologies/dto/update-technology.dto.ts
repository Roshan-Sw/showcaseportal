import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTechnologyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  created_by?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updated_by?: number;
}
