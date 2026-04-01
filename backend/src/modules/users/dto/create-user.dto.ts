import { IsString, IsEmail, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firebaseUid: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsEnum(['student', 'judge', 'admin'])
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;

  @IsString()
  @IsOptional()
  career?: string;

  @IsString()
  @IsOptional()
  specialty?: string;
}
