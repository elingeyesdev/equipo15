import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IdeaStatus } from '@prisma/client';

export class UpdateIdeaStatusDto {
  @ApiProperty({ enum: IdeaStatus })
  @IsEnum(IdeaStatus)
  status!: IdeaStatus;
}
