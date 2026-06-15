import { IsArray, IsOptional, IsString } from 'class-validator';

export class TargetAudienceDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ageRanges?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  participantTypes?: string[];
}
