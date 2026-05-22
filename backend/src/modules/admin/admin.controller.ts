import { Controller, Get, Post, Param, Request, UseGuards, Patch } from '@nestjs/common';
import { Body, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { AdminService } from './admin.service';
import { GlobalAnalyticsResponseDto } from './dto/global-analytics-response.dto';
import { CreateAllowedDomainDto } from './dto/create-allowed-domain.dto';
import { AllowedDomainResponseDto } from './dto/allowed-domain-response.dto';
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

  @Get('whitelist-domains')
  @ApiOperation({ summary: 'List allowed domains' })
  @ApiResponse({ status: 200, type: [AllowedDomainResponseDto] })
  async getAllowedDomains() {
    return this.adminService.getAllowedDomains();
  }

  @Get('whitelist')
  @ApiOperation({ summary: 'List allowed domains (legacy route)' })
  @ApiResponse({ status: 200, type: [AllowedDomainResponseDto] })
  async getAllowedDomainsLegacy() {
    return this.adminService.getAllowedDomains();
  }

  @Post('whitelist-domains')
  @ApiOperation({ summary: 'Add allowed domain' })
  @ApiResponse({ status: 201, type: AllowedDomainResponseDto })
  async addAllowedDomain(@Body() dto: CreateAllowedDomainDto) {
    return this.adminService.addAllowedDomain(dto);
  }

  @Post('whitelist')
  @ApiOperation({ summary: 'Add allowed domain (legacy route)' })
  @ApiResponse({ status: 201, type: AllowedDomainResponseDto })
  async addAllowedDomainLegacy(@Body() dto: CreateAllowedDomainDto) {
    return this.adminService.addAllowedDomain(dto);
  }

  @Patch('whitelist-domains/:id/status')
  @ApiOperation({ summary: 'Toggle allowed domain status' })
  @ApiResponse({ status: 200, type: AllowedDomainResponseDto })
  async updateAllowedDomainStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.updateAllowedDomainStatus(id, body.isActive);
  }

  @Patch('whitelist/:id/status')
  @ApiOperation({ summary: 'Toggle allowed domain status (legacy route)' })
  @ApiResponse({ status: 200, type: AllowedDomainResponseDto })
  async updateAllowedDomainStatusLegacy(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.updateAllowedDomainStatus(id, body.isActive);
  }

  @Delete('whitelist-domains/:id')
  @ApiOperation({ summary: 'Remove allowed domain' })
  @ApiResponse({ status: 200, type: AllowedDomainResponseDto })
  async removeAllowedDomain(@Param('id') id: string) {
    return this.adminService.removeAllowedDomain(id);
  }

  @Delete('whitelist/:id')
  @ApiOperation({ summary: 'Remove allowed domain (legacy route)' })
  @ApiResponse({ status: 200, type: AllowedDomainResponseDto })
  async removeAllowedDomainLegacy(@Param('id') id: string) {
    return this.adminService.removeAllowedDomain(id);
  }
}
