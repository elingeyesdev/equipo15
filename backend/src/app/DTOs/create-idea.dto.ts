import { IsString, MinLength, IsArray, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(50, { message: 'Describe el problema con al menos 50 caracteres para dar contexto.' })
  problem: string;

  @IsString()
  @MinLength(50, { message: 'La solución debe tener al menos 50 caracteres para ser evaluable.' })
  solution: string;

  @IsString()
  author: string;

  @IsString()
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
