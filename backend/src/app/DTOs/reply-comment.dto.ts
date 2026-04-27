import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { COMMENT_CONTENT_RULES } from '../Utils/comment-validation.util';

export class ReplyCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'La respuesta no puede estar vacía.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(COMMENT_CONTENT_RULES.minLength, {
    message: 'La respuesta debe tener al menos 2 caracteres.',
  })
  @MaxLength(COMMENT_CONTENT_RULES.maxLength, {
    message: 'La respuesta no puede superar los 2000 caracteres.',
  })
  content: string;
}
