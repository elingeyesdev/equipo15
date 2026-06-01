import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Challenge } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dtos/create-challenge.dto';
import { UpdateChallengeDto } from './dtos/update-challenge.dto';
import { FinalizePodiumDto } from './dtos/finalize-podium.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@ApiTags('Challenges')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('company')
  @ApiOperation({ summary: 'Create a new challenge (Company only)' })
  @ApiResponse({
    status: 201,
    description: 'The challenge has been successfully created.',
  })
  async create(
    @Body() createChallengeDto: CreateChallengeDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Challenge> {
    const user = await this.challengeService.getUserByUid(req.user.uid);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado en el sistema.');
    }
    return this.challengeService.create(createChallengeDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all public challenges' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.challengeService.findAll(
      paginationDto,
      paginationDto.status,
      req.user.uid,
    );
  }

  @Get('global-stats')
  @ApiOperation({ summary: 'Get global stats for challenges' })
  @ApiResponse({ status: 200, description: 'Return global statistics.' })
  getGlobalStats() {
    return this.challengeService.getGlobalStats();
  }

  @Get('judges/search')
  @UseGuards(RolesGuard)
  @Roles('company', 'admin')
  @ApiOperation({ summary: 'Search judges by name or email' })
  @ApiQuery({ name: 'q', required: true, type: String })
  searchJudges(@Query('q') query: string) {
    return this.challengeService.searchJudges(query);
  }

  @Get('company/innovation-stats')
  @UseGuards(RolesGuard)
  @Roles('company')
  @ApiOperation({
    summary: 'Get innovation statistics for the company dashboard (E1.4)',
    description:
      "Returns: ideas grouped by faculty (bar chart), daily likes/comments interactions (line chart), and KPI cards (total ideas, most active user, leading faculty). Scoped to the authenticated company's own challenges.",
  })
  @ApiResponse({
    status: 200,
    description: 'Innovation stats returned successfully.',
    schema: {
      example: {
        ideasByFaculty: [
          { facultyId: 1, facultyName: 'Ingeniería', ideasCount: 12 },
        ],
        interactionsByDay: [{ date: '2025-04-01', likes: 8, comments: 3 }],
        kpis: {
          totalIdeas: 42,
          mostActiveUser: { name: 'Ana Pérez', ideaCount: 7 },
          leadingFaculty: {
            facultyId: 1,
            facultyName: 'Ingeniería',
            ideasCount: 12,
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'challengeId', required: false, type: String })
  getInnovationStats(
    @Request() req: AuthenticatedRequest,
    @Query('challengeId') challengeId?: string,
  ) {
    return this.challengeService.getInnovationStats(req.user.uid, challengeId);
  }

  @Get('company/challenges')
  @UseGuards(RolesGuard)
  @Roles('company')
  @ApiOperation({
    summary: 'Get company-owned challenges for dashboard filters',
  })
  getCompanyChallenges(@Request() req: AuthenticatedRequest) {
    return this.challengeService.getCompanyChallenges(req.user.uid);
  }

  // ─── Judge Inbox: Assigned Challenges (E3.2) ───────────────────────────────

  @Get('judge/assigned-challenges')
  @UseGuards(RolesGuard)
  @Roles('judge')
  @ApiOperation({
    summary: 'Get challenges assigned to the authenticated judge (E3.2)',
    description: 'Returns all challenges where the current user is assigned as a judge.',
  })
  @ApiResponse({ status: 200, description: 'Assigned challenges returned successfully.' })
  getAssignedChallengesForJudge(@Request() req: AuthenticatedRequest) {
    return this.challengeService.getAssignedChallengesForJudge(req.user.uid);
  }

  // ─── Judge Inbox: Finalist Ideas (E3.1) ────────────────────────────────────

  @Get('judge/assigned-ideas')
  @UseGuards(RolesGuard)
  @Roles('judge')
  @ApiOperation({
    summary: 'Get finalist ideas assigned to the authenticated judge (E3.1)',
    description:
      'Returns ideas with FINALIST status from challenges where the current user is assigned as a judge. Includes an "evaluated" flag per idea.',
  })
  @ApiResponse({ status: 200, description: 'Finalist ideas returned successfully.' })
  getFinalistIdeasForJudge(@Request() req: AuthenticatedRequest) {
    return this.challengeService.getFinalistIdeasForJudge(req.user.uid);
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Get a private challenge by its access token' })
  findByToken(@Param('token') token: string) {
    return this.challengeService.findByToken(token);
  }

  @Get(':id/judges')
  @UseGuards(RolesGuard)
  @Roles('company', 'admin')
  @ApiOperation({ summary: 'Get assigned judges for a challenge' })
  getAssignedJudges(@Param('id') id: string) {
    return this.challengeService.getAssignedJudges(id);
  }

  @Put(':id/judges')
  @UseGuards(RolesGuard)
  @Roles('company')
  @ApiOperation({ summary: 'Assign judges to a challenge' })
  assignJudges(
    @Param('id') id: string,
    @Body() dto: import('./dtos/assign-judges.dto').AssignJudgesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.challengeService.assignJudges(id, dto, req.user.uid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific challenge by ID' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.challengeService.findOne(id, req.user.uid);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get stats for a specific challenge' })
  getChallengeStats(@Param('id') id: string) {
    return this.challengeService.getChallengeStats(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('company')
  @ApiOperation({ summary: 'Update a challenge (Company only)' })
  update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ) {
    return this.challengeService.update(id, updateChallengeDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('company')
  @ApiOperation({ summary: 'Delete a challenge (Company only)' })
  remove(@Param('id') id: string) {
    return this.challengeService.delete(id);
  }

  @Post(':id/finalize-podium')
  @UseGuards(RolesGuard)
  @Roles('company')
  @ApiOperation({ summary: 'Finalize challenge podium (Company only)' })
  @ApiResponse({
    status: 200,
    description: 'The podium has been finalized and ideas marked as finalists.',
  })
  finalizePodium(
    @Param('id') id: string,
    @Body() dto: FinalizePodiumDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.challengeService.finalizePodium(id, dto, req.user.uid);
  }
}
