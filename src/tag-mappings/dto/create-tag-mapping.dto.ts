import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTagMappingDto {
  @IsEnum(['WEBSITE', 'VIDEO'])
  @IsNotEmpty()
  entity_type: 'WEBSITE' | 'VIDEO';

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  website_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  video_id?: number;

  @IsString()
  @IsNotEmpty()
  tag_name: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  created_by?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updated_by?: number;
}
