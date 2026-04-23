import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetCommentsQueryDto extends PaginationDto {
  @ApiProperty({ description: 'Id de la idea de la que se desean obtener comentarios' })
  @IsUUID()
  ideaId: string;

  @ApiPropertyOptional({
    description: 'Id del comentario padre para listar respuestas; si no se envía, se listan comentarios raíz',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiPropertyOptional({
    description: 'Orden de los comentarios',
    enum: ['newest', 'oldest'],
    default: 'oldest',
  })
  @IsOptional()
  @IsIn(['newest', 'oldest'], {
    message: 'El orden permitido para comentarios es newest o oldest.',
  })
  override sort?: 'newest' | 'oldest' = undefined;

  @ApiPropertyOptional({
    description: 'Máximo de comentarios por página',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'No puedes solicitar más de 100 comentarios por página.' })
  override limit?: number = undefined;
}