import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'El problema no puede estar vacío.' })
  problem: string;

  @IsString()
  @IsNotEmpty({ message: 'La solución no puede estar vacía.' })
  solution: string;

  @IsString()
  @IsNotEmpty({ message: 'El challengeId es obligatorio.' })
  challengeId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsEnum(['draft', 'public', 'top5', 'archived'])
  @IsOptional()
  status?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multimediaLinks?: string[];
}
