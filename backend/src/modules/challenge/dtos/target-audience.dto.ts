import { IsArray, IsString } from 'class-validator';

export class TargetAudienceDto {
  @IsArray()
  @IsString({ each: true })
  ageRanges!: string[];

  @IsArray()
  @IsString({ each: true })
  participantTypes!: string[];
}
