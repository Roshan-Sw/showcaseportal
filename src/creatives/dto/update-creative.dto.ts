import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCreativeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  priority?: number;

  @IsEnum(['LOGO', 'BROCHURE'])
  @IsOptional()
  type?: 'LOGO' | 'BROCHURE';

  @IsString()
  @IsOptional()
  file?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsDateString()
  @IsOptional()
  created_at?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  created_by?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updated_by?: number;
}
