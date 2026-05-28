import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { IsAllowedDomain } from '../../../common/validators/is-allowed-domain.validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firebaseUid!: string;

  @IsEmail()
  @IsAllowedDomain()
  email!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  studentCode?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  facultyId?: string | number;

  @IsNumber()
  @IsOptional()
  enrollmentYear?: number;
}
