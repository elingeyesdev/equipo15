import { Transform } from 'class-transformer';
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { COMMENT_CONTENT_RULES } from '../Utils/comment-validation.util';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(COMMENT_CONTENT_RULES.minLength, {
    message: 'El comentario debe tener al menos 2 caracteres.',
  })
  @MaxLength(COMMENT_CONTENT_RULES.maxLength, {
    message: 'El comentario no puede superar los 2000 caracteres.',
  })
  content: string;
}
