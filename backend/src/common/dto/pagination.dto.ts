import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Número de página activa',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos a retornar por página',
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (ej: Activo, Borrador)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por id de reto asociado',
  })
  @IsOptional()
  @IsString()
  challengeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo públicos',
  })
  @IsOptional()
  @IsString()
  public?: string;

  @ApiPropertyOptional({
    description: 'Buscar por palabra clave en título, problema o solución',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por fecha: newest (más recientes) u oldest (más antiguas)',
    enum: ['newest', 'oldest'],
  })
  @IsOptional()
  @IsIn(['newest', 'oldest'])
  sort?: 'newest' | 'oldest';
}
