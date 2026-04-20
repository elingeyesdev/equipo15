import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.interface';
import { CreateCommentDto } from '../../DTOs/create-comment.dto';
import { GetCommentsQueryDto } from '../../DTOs/get-comments-query.dto';
import { ReplyCommentDto } from '../../DTOs/reply-comment.dto';
import { CommentService } from '../../Services/comment.service';

@ApiTags('Comentarios')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('comentarios')
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener comentarios de una idea' })
  @ApiQuery({ name: 'ideaId', required: true, type: String })
  @ApiQuery({ name: 'parentCommentId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest'] })
  getComments(@Query() query: GetCommentsQueryDto) {
    return this.commentService.findComments(query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un comentario sobre una idea' })
  @ApiResponse({ status: 201, description: 'Comentario creado correctamente.' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commentService.createComment({
      ...createCommentDto,
      firebaseUid: request.user.uid,
    });
  }

  @Post(':id/responder')
  @ApiOperation({ summary: 'Responder a un comentario' })
  @ApiResponse({ status: 201, description: 'Respuesta creada correctamente.' })
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() replyCommentDto: ReplyCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commentService.replyToComment({
      parentCommentId: id,
      content: replyCommentDto.content,
      firebaseUid: request.user.uid,
    });
  }
}