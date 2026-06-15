import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChallengeStatus } from '../../../common/enums/challenge-status.enum';
import { IsWithinSixMonths } from '../../../common/validators/is-within-six-months.decorator';
import { HasMinimumUniqueWords } from '../../../common/validators/has-unique-words.decorator';
import { NoInsecureUrls } from '../../../common/validators/no-insecure-urls.decorator';
import { NoExcessiveSymbols } from '../../../common/validators/no-excessive-symbols.decorator';
import { EvaluationCriteriaItemDto } from './evaluation-criteria-item.dto';
import { TargetAudienceDto } from './target-audience.dto';
import { IsWordCount } from '../../../common/validators/word-count.decorator';

export class CreateChallengeDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  // ── Título: 2–15 palabras, único campo obligatorio para borrador ──────────
  @IsString()
  @IsNotEmpty()
  @IsWordCount(2, 15, { message: 'El título debe tener entre 2 y 15 palabras.' })
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoExcessiveSymbols(0.3)
  title!: string;

  // ── Campos opcionales: 10–250 palabras cuando se proporcionan ─────────────
  @IsString()
  @IsOptional()
  @IsWordCount(10, 250, { message: 'La descripción del problema debe tener entre 10 y 250 palabras.' })
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoExcessiveSymbols(0.3)
  problemDescription?: string;

  @IsString()
  @IsOptional()
  @IsWordCount(10, 250, { message: 'El contexto de la empresa debe tener entre 10 y 250 palabras.' })
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoExcessiveSymbols(0.3)
  companyContext?: string;

  @IsString()
  @IsOptional()
  @IsWordCount(10, 250, { message: 'Las reglas de participación deben tener entre 10 y 250 palabras.' })
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoExcessiveSymbols(0.3)
  participationRules?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsDateString()
  @IsOptional()
  @IsWithinSixMonths('publishedAt')
  submissionsOpenAt?: string;

  @IsDateString()
  @IsOptional()
  submissionsCloseAt?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  facultyId?: string | number;

  @IsEnum(ChallengeStatus)
  @IsOptional()
  status?: ChallengeStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  publicationDate?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriteriaItemDto)
  evaluationCriteria?: EvaluationCriteriaItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience?: TargetAudienceDto;

}
