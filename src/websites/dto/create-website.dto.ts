import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWebsiteDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  client_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(['WEBSITE', 'LANDING_PAGE'])
  @IsNotEmpty()
  type: 'WEBSITE' | 'LANDING_PAGE';

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
