import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IdeaService } from '../../Services/idea.service';
import { CreateIdeaDto } from '../../DTOs/create-idea.dto';
import { CreateDraftIdeaDto } from '../../DTOs/create-draft-idea.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';

@ApiTags('Ideas')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new idea' })
  create(@Body() createIdeaDto: CreateIdeaDto) {
    return this.ideaService.create(createIdeaDto);
  }

  @Post('drafts')
  @ApiOperation({ summary: 'Save an idea as a draft' })
  createDraft(@Body() createDraftIdeaDto: CreateDraftIdeaDto) {
    return this.ideaService.createDraft(createDraftIdeaDto);
  }

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'Get all ideas (optionally filter by public only)' })
  @ApiQuery({ name: 'public', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('public') isPublic?: string,
    @Query() paginationDto?: PaginationDto,
  ) {
    if (isPublic === 'true') {
      return this.ideaService.findAllPublic(paginationDto);
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

  @Post(':id/like')
  @ApiOperation({ summary: 'Like or unlike an idea' })
  addLike(@Param('id') id: string) {
    return this.ideaService.addLike(id);
  }
}
