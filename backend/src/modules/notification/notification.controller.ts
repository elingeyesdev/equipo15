import { Controller, Get, Patch, Param, UseGuards, Request, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private async getUserId(user: any): Promise<string> {
    let id = user.id;
    if (!id && user.uid) {
      const dbUser = await this.notificationService.getUserByFirebaseUid(user.uid);
      id = dbUser?.id;
    }
    if (!id) {
      throw new UnauthorizedException('Usuario no registrado o no encontrado en la base de datos.');
    }
    return id;
  }

  @Get('my-inbox')
  @ApiOperation({ summary: 'Get current user notifications' })
  async getMyInbox(@Request() req: any) {
    const userId = await this.getUserId(req.user);
    return this.notificationService.getMyInbox(userId);
  }

  @Patch('device')
  @ApiOperation({ summary: 'Register a device for push notifications' })
  async registerDevice(@Request() req: any, @Body() body: { token: string }) {
    const userId = await this.getUserId(req.user);
    if (body.token) {
      await this.notificationService.registerDevice(userId, body.token);
    }
    return { success: true };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get current user unread count' })
  async getUnreadCount(@Request() req: any) {
    const userId = await this.getUserId(req.user);
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = await this.getUserId(req.user);
    await this.notificationService.markAsRead(id, userId);
    return { success: true };
  }
}

