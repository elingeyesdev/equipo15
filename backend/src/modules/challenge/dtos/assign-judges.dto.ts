import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMaxSize } from 'class-validator';

export class AssignJudgesDto {
  @ApiProperty({
    description: 'Array de IDs de usuarios (jueces) a asignar',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, {
    message: 'No se pueden asignar más de 5 jueces a un reto.',
  })
  judgeIds: string[];
}
