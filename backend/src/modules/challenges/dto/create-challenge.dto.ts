import { 
  IsString, 
  IsNotEmpty, 
  IsDateString, 
  IsBoolean, 
  IsOptional, 
  IsEnum 
} from 'class-validator';
import { ChallengeStatus } from '../entities/challenge.status';

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  problemDescription: string;

  @IsString()
  @IsNotEmpty()
  companyContext: string;

  @IsString()
  @IsNotEmpty()
  participationRules: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  publicationDate: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  facultyId?: string;

  @IsEnum(ChallengeStatus)
  @IsOptional()
  status?: ChallengeStatus;
}
