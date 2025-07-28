import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVideoDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  client_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  video_url: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsEnum(['LANDSCAPE', 'PORTRAIT', 'SQUARE'])
  @IsNotEmpty()
  format: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE';

  @IsEnum([
    'CORPORATE_VIDEO',
    'AD_FILM',
    'REEL',
    'ANIMATION',
    'INTERVIEW',
    'PORTRAIT',
  ])
  @IsNotEmpty()
  type:
    | 'CORPORATE_VIDEO'
    | 'AD_FILM'
    | 'REEL'
    | 'ANIMATION'
    | 'INTERVIEW'
    | 'PORTRAIT';

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  created_by?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updated_by?: number;
}
