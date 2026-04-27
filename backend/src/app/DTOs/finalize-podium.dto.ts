import { IsEnum, IsNumber, Min } from 'class-validator';

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

  @IsNumber()
  @Min(1, { message: 'El límite debe ser al menos 1.' })
  limit: number;
}
