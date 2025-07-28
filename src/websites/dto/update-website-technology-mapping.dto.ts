import { IsInt, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWebsiteTechnologyMappingsDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ each: true })
  @Type(() => Number)
  technology_ids: number[];

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  created_by?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updated_by?: number;
}
