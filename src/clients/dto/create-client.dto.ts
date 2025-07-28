import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClientDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  id: number;

  @IsString()
  @IsOptional()
  client_name?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  country_id?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  description1?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  priority?: number;
}
