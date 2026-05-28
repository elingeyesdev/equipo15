import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  MinLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class EvaluationScoreDto {
  @IsString()
  criterionId!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score!: number;
}

export class CreateEvaluationDto {
  @IsString()
  ideaId!: string;

  @IsString()
  judgeId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => EvaluationScoreDto)
  scores!: EvaluationScoreDto[];

  @IsString()
  @IsOptional()
  @MinLength(5)
  feedback?: string;
}
