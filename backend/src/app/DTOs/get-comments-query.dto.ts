import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
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
}