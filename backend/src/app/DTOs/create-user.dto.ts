import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { IsAllowedDomain } from '../../common/validators/is-allowed-domain.validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firebaseUid: string;

  @IsEmail()
  @IsAllowedDomain()
  email: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;

  @IsString()
  @IsOptional()
  career?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @IsBoolean()
  @IsOptional()
  isFacultyVerified?: boolean;
}
