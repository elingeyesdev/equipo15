import { ApiProperty } from '@nestjs/swagger';

export class ChallengeAnalyticsDto {
  @ApiProperty({ example: 42 })
  all: number;

  @ApiProperty({ example: 12 })
  active: number;
}

export class ChallengePerformanceDto {
  @ApiProperty({ example: 'b0eeb9bb-8b2b-47e0-9430-1b2c45f4c4a4' })
  id: string;

  @ApiProperty({ example: 'Sustentabilidad Hídrica' })
  title: string;

  @ApiProperty({ example: 'TechCorp' })
  companyName: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: 175 })
  totalInteractions: number;

  @ApiProperty({ example: 4.8, required: false, nullable: true })
  averageScore: number | null;
}

export class GlobalAnalyticsResponseDto {
  @ApiProperty({ example: 15 })
  totalCompanies: number;

  @ApiProperty({ type: ChallengeAnalyticsDto })
  totalChallenges: ChallengeAnalyticsDto;

  @ApiProperty({ example: 1204 })
  totalIdeas: number;

  @ApiProperty({ type: [ChallengePerformanceDto] })
  challengesPerformance: ChallengePerformanceDto[];
}
