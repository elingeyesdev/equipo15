import { IsString, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { ImpactAreaEnum, ImprovementTypeEnum, EffortLevelEnum } from './create-idea.dto';

export class CreateDraftIdeaDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  problem?: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsString()
  @IsOptional()
  challengeId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

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
