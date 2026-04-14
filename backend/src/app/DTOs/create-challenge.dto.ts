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

export class CreateChallengeDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  title: string;

  @IsString()
  @IsOptional()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  problemDescription?: string;

  @IsString()
  @IsOptional()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
  companyContext?: string;

  @IsString()
  @IsOptional()
  @HasMinimumUniqueWords(0.3)
  @NoInsecureUrls()
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
}
