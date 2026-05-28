import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multimediaLinks?: string[];

  @IsString()
  @IsOptional()
  impactArea?: string;

  @IsString()
  @IsOptional()
  improvementType?: string;

  @IsString()
  @IsOptional()
  effortLevel?: string;
}
