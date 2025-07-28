import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  description1?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  priority?: number;
}
