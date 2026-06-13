import { IsString, IsOptional, IsBoolean, Matches, IsEmail } from 'class-validator';

export class SyncUserDto {
  @IsString()
  @IsOptional()
  firebaseUid?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  preventCreation?: boolean;

  @IsString()
  @IsOptional()
  @Matches(/^\+591\d{8}$/, {
    message: 'El número de teléfono debe tener el formato boliviano (+591 seguido de 8 dígitos).',
  })
  phone?: string;
}
