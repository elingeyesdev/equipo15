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

export class CreateChallengeDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  problemDescription?: string;

  @IsString()
  @IsOptional()
  companyContext?: string;

  @IsString()
  @IsOptional()
  participationRules?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
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
