import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createIdeaDto: CreateIdeaDto) {
    return this.ideasService.create(createIdeaDto);
  }

  @Get()
  findAll() {
    return this.ideasService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ideasService.updateStatus(id, status);
  }
}
