import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.interface';
import { CreateCommentDto } from '../../dtos/create-comment.dto';
import { GetCommentsQueryDto } from '../../dtos/get-comments-query.dto';
import { ReplyCommentDto } from '../../dtos/reply-comment.dto';
import { UpdateCommentDto } from '../../dtos/update-comment.dto';
import { CommentService } from '../../services/comment.service';

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
  @ApiQuery({ name: 'includeReplies', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest'] })
  getComments(
    @Query() query: GetCommentsQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commentService.findComments(query, request.user.uid);
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

  @Delete(':id')
  @ApiOperation({
    summary: 'Retirar comentario (autor, company dueña del reto o admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario retirado correctamente.',
  })
  withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commentService.withdrawComment({
      commentId: id,
      firebaseUid: request.user.uid,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un comentario' })
  @ApiResponse({
    status: 200,
    description: 'Comentario editado correctamente.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commentService.updateComment({
      commentId: id,
      content: updateCommentDto.content,
      firebaseUid: request.user.uid,
    });
  }
}
