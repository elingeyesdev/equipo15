import { IsString, IsInt, Min, Max, IsMongoId, IsOptional, MinLength } from 'class-validator';

export class CreateEvaluationDto {
  @IsMongoId()
  ideaId: string;

  @IsMongoId()
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
