import { IsString, IsEmail, IsEnum, IsOptional, IsNotEmpty, Matches, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firebaseUid: string;

  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@(?!(gmail|hotmail|outlook|yahoo)\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, {
    message: 'El correo debe ser de dominio corporativo o institucional.'
  })
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

  @IsNumber()
  @IsOptional()
  facultyId?: number;

  @IsBoolean()
  @IsOptional()
  isFacultyVerified?: boolean;
}
