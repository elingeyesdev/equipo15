import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY',
  JUDGE = 'JUDGE',
  USER = 'USER',
}

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: UserRoleEnum,
    description: 'Nuevo rol a asignar al usuario',
    example: UserRoleEnum.JUDGE,
  })
  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(UserRoleEnum, {
    message: 'Rol inválido. Valores permitidos: ADMIN, COMPANY, JUDGE, USER',
  })
  role: UserRoleEnum;
}
