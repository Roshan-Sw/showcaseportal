import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTagMappingDto {
  @IsEnum(['WEBSITE', 'VIDEO', 'CREATIVE'])
  @IsNotEmpty()
  entity_type: 'WEBSITE' | 'VIDEO' | 'CREATIVE';

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  entity_id: number;

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
