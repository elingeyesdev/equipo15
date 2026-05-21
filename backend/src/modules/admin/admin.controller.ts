import { Controller, Get, Post, Param, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { AdminService } from './admin.service';
import { GlobalAnalyticsResponseDto } from './dto/global-analytics-response.dto';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('companies')
  @ApiOperation({ summary: 'List companies available for admin support' })
  async getCompanies() {
    return this.adminService.getCompanies();
  }

  @Post('companies/:id/impersonate')
  @ApiOperation({ summary: 'Create a temporary read-only session for a company' })
  async impersonateCompany(
    @Param('id') companyId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.createCompanyImpersonation(
      companyId,
      req.user.uid,
      req.user.email || null,
    );
  }

  @Get('global')
  @ApiOperation({ summary: 'Get global platform analytics for admin dashboard' })
  @ApiResponse({ status: 200, type: GlobalAnalyticsResponseDto })
  async getGlobalAnalytics() {
    return this.adminService.getGlobalAnalytics();
  }

  @Get('analytics/global')
  @ApiOperation({ summary: 'Get global platform analytics for admin dashboard (legacy route)' })
  @ApiResponse({ status: 200, type: GlobalAnalyticsResponseDto })
  async getGlobalAnalyticsLegacy() {
    return this.adminService.getGlobalAnalytics();
  }
}
