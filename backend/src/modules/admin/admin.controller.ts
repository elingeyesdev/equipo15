import { Controller, Delete, Get, Patch, Post, Put, Param, Query, Request, UseGuards } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { AdminService } from './admin.service';
import { GlobalAnalyticsResponseDto } from './dto/global-analytics-response.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateAllowedDomainDto } from './dto/create-allowed-domain.dto';
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

  @Get('users')
  @ApiOperation({ summary: 'Search users by name or email with optional role filter' })
  @ApiResponse({ status: 200, description: 'Paginated list of users matching the search criteria' })
  async searchUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.searchUsers(
      search,
      role,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('users/:id/reputation')
  @ApiOperation({ summary: 'Get student reputation profile for judge promotion evaluation' })
  @ApiResponse({ status: 200, description: 'Student reputation profile with metrics and idea history' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserReputation(@Param('id') userId: string) {
    return this.adminService.getUserReputation(userId);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role (transactional mutation)' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid role value' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto.role);
  }

  @Get('whitelist-domains')
  @ApiOperation({ summary: 'List all allowed email domains (whitelist)' })
  async getWhitelistDomains() {
    return this.adminService.getAllowedDomains();
  }

  @Get('whitelist')
  @ApiOperation({ summary: 'List all allowed email domains (whitelist) — legacy alias' })
  async getWhitelistDomainsLegacy() {
    return this.adminService.getAllowedDomains();
  }

  @Post('whitelist-domains')
  @ApiOperation({ summary: 'Add a domain to the whitelist' })
  async addWhitelistDomain(@Body() dto: CreateAllowedDomainDto) {
    return this.adminService.addAllowedDomain(dto);
  }

  @Patch('whitelist-domains/:id/status')
  @ApiOperation({ summary: 'Toggle whitelist domain active/inactive' })
  async updateWhitelistDomainStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateAllowedDomainStatus(id, isActive);
  }

  @Delete('whitelist-domains/:id')
  @ApiOperation({ summary: 'Remove a domain from the whitelist' })
  async removeWhitelistDomain(@Param('id') id: string) {
    return this.adminService.removeAllowedDomain(id);
  }
}
