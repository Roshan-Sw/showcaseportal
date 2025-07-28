import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWebsiteDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  client_id?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(['WEBSITE', 'LANDING_PAGE'])
  @IsOptional()
  type?: 'WEBSITE' | 'LANDING_PAGE';

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsDateString()
  @IsOptional()
  launch_date?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  created_by?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updated_by?: number;
}
