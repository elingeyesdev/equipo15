import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { ChallengeStatus } from '../Models/challenge-status.enum';
import { IsWithinSixMonths } from '../../common/validators/is-within-six-months.decorator';
import { HasMinimumUniqueWords } from '../../common/validators/has-unique-words.decorator';
import { NoInsecureUrls } from '../../common/validators/no-insecure-urls.decorator';
import { NoNumbers } from '../../common/validators/no-numbers.decorator';
import { NoExcessiveSymbols } from '../../common/validators/no-excessive-symbols.decorator';

export class CreateChallengeDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoNumbers()
  @NoExcessiveSymbols(0.3)
  title: string;

  @IsString()
  @IsOptional()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoExcessiveSymbols(0.3)
  problemDescription?: string;

  @IsString()
  @IsOptional()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoExcessiveSymbols(0.3)
  companyContext?: string;

  @IsString()
  @IsOptional()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  @NoExcessiveSymbols(0.3)
  participationRules?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @IsWithinSixMonths('startDate')
  endDate?: string;

  @IsDateString()
  @IsOptional()
  publicationDate?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @IsEnum(ChallengeStatus)
  @IsOptional()
  status?: ChallengeStatus;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsOptional()
  evaluationCriteria?: any;
}
