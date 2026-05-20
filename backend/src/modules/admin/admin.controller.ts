import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { AdminService } from './admin.service';
import { GlobalAnalyticsResponseDto } from './dto/global-analytics-response.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get global platform analytics for admin dashboard' })
  @ApiResponse({ status: 200, type: GlobalAnalyticsResponseDto })
  async getGlobalAnalytics() {
    return this.adminService.getGlobalAnalytics();
  }
}
