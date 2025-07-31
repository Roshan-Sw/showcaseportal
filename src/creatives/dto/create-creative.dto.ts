import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreativeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  priority?: number;

  @IsEnum(['LOGO', 'BROCHURE'])
  @IsNotEmpty()
  type: 'LOGO' | 'BROCHURE';

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
