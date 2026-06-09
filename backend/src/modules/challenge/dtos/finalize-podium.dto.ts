import { IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum RankingCategory {
  LIKES = 'likes',
  COMMENTS = 'comments',
  VOTES = 'votes',
}

export class FinalizePodiumDto {
  @IsEnum(RankingCategory, {
    message: 'La categoría debe ser likes, comments o votes.',
  })
  category: RankingCategory;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'El límite debe ser al menos 1.' })
  limit: number;
}
