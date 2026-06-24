import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  ORGANIZATION = 'ORGANIZATION',
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
    message: 'Rol inválido. Valores permitidos: ADMIN, ORGANIZATION, JUDGE, USER',
  })
  role: UserRoleEnum;
}
