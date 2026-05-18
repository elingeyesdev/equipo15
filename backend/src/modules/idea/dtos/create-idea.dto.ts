import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum ImpactAreaEnum {
  PRODUCTIVITY = 'PRODUCTIVITY',
  COSTS = 'COSTS',
  CUSTOMERS = 'CUSTOMERS',
  TEAM = 'TEAM',
  GROWTH = 'GROWTH',
  SUSTAINABILITY = 'SUSTAINABILITY',
  SOCIAL_IMPACT = 'SOCIAL_IMPACT',
}

export enum ImprovementTypeEnum {
  OPTIMIZES = 'OPTIMIZES',
  ENHANCES = 'ENHANCES',
  EXPANDS = 'EXPANDS',
  TRANSFORMS = 'TRANSFORMS',
}

export enum EffortLevelEnum {
  EASY = 'EASY',
  COORDINATION = 'COORDINATION',
  DEVELOPMENT = 'DEVELOPMENT',
  TRANSFORMATION = 'TRANSFORMATION',
}

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

  @IsEnum(ImpactAreaEnum)
  @IsOptional()
  impactArea?: ImpactAreaEnum;

  @IsEnum(ImprovementTypeEnum)
  @IsOptional()
  improvementType?: ImprovementTypeEnum;

  @IsEnum(EffortLevelEnum)
  @IsOptional()
  effortLevel?: EffortLevelEnum;
}
