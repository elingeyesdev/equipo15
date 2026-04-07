import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateDraftIdeaDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  problem?: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsString()
  author: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
