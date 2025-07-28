import { IsString, IsInt, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVideoDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  client_id?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  video_url?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsEnum(['LANDSCAPE', 'PORTRAIT', 'SQUARE'])
  @IsOptional()
  format?: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE';

  @IsEnum([
    'CORPORATE_VIDEO',
    'AD_FILM',
    'REEL',
    'ANIMATION',
    'INTERVIEW',
    'PORTRAIT',
  ])
  @IsOptional()
  type?:
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
