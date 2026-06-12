import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class EvaluationCriteriaItemDto {
  // Ignoraremos el ID del cliente para generar uno nuevo en el backend o manejarlo sin confiar en él
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;
}
