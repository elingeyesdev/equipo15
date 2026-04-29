import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IdeaService } from '../../services/idea.service';
import { CreateIdeaDto } from '../../dtos/create-idea.dto';
import { CreateDraftIdeaDto } from '../../dtos/create-draft-idea.dto';
import { UpdateIdeaDto } from '../../dtos/update-idea.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.interface';

@ApiTags('Ideas')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new idea' })
  create(
    @Body() createIdeaDto: CreateIdeaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ideaService.create(createIdeaDto, request.user.uid);
  }

  @Post('drafts')
  @ApiOperation({ summary: 'Save an idea as a draft' })
  createDraft(
    @Body() createDraftIdeaDto: CreateDraftIdeaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ideaService.createDraft(createDraftIdeaDto, request.user.uid);
  }

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'Get all ideas (optionally filter by public only)' })
  @ApiQuery({ name: 'public', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'likes', 'comments'],
  })
  findAll(
    @Query('public') isPublic?: string,
    @Query() paginationDto?: PaginationDto,
    @Req() request?: AuthenticatedRequest,
  ) {
    if (isPublic === 'true') {
      return this.ideaService.findAllPublic(paginationDto, request?.user?.uid);
    }
    return this.ideaService.findAll(paginationDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update the status of an idea (Admin only)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ideaService.updateStatus(id, status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an idea (author only)' })
  updateIdea(
    @Param('id') id: string,
    @Body() updateIdeaDto: UpdateIdeaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ideaService.updateIdea(id, updateIdeaDto, request.user.uid);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like or unlike an idea' })
  addLike(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.ideaService.addLike(id, request.user.uid);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Favorite or unfavorite an idea' })
  toggleFavorite(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ideaService.toggleFavorite(id, request.user.uid);
  }
}
