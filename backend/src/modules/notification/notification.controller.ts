import { Controller, Get, Patch, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('my-inbox')
  @ApiOperation({ summary: 'Get current user notifications' })
  async getMyInbox(@Request() req: any) {
    const user = req.user as any;
    return this.notificationService.getMyInbox(user.id);
  }

  @Patch('device')
  @ApiOperation({ summary: 'Register a device for push notifications' })
  async registerDevice(@Request() req: any, @Body() body: { token: string }) {
    const user = req.user as any;
    if (body.token) {
      await this.notificationService.registerDevice(user.id, body.token);
    }
    return { success: true };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get current user unread count' })
  async getUnreadCount(@Request() req: any) {
    const user = req.user as any;
    const count = await this.notificationService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const user = req.user as any;
    await this.notificationService.markAsRead(id, user.id);
    return { success: true };
  }
}
