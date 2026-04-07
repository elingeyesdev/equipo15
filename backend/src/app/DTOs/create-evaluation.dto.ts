import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  ideaId: string;

  @IsString()
  judgeId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @IsString()
  @IsOptional()
  @MinLength(5)
  feedback?: string;
}
