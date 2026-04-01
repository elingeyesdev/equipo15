import { IsString, MinLength, IsArray, IsOptional, IsBoolean, IsMongoId, IsEnum } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsMongoId()
  author: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsEnum(['draft', 'public', 'top5', 'archived'])
  @IsOptional()
  status?: string;
}
