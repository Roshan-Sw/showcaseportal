import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScopeType } from '@prisma/client';

export class ProjectScopeDto {
  @IsEnum(ScopeType)
  @IsNotEmpty()
  scopeType: ScopeType;

  @IsBoolean()
  @IsOptional()
  isSelected?: boolean;
}

export class CreateProjectDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  id: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  clientId?: number;

  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  priority?: number;

  @IsDateString()
  @IsOptional()
  startdate?: string;

  @IsArray()
  @IsOptional()
  @Type(() => ProjectScopeDto)
  scopes?: ProjectScopeDto[];
}
