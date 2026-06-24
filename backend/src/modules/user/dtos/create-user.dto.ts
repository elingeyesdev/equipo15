import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Matches,
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
  @Matches(/^\+591\d{8}$/, {
    message: 'El número de teléfono debe tener el formato boliviano (+591 seguido de 8 dígitos).',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  studentCode?: string;

  @IsOptional()
  facultyId?: string | number;

  @IsNumber()
  @IsOptional()
  enrollmentYear?: number;
}
