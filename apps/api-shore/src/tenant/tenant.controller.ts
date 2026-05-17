import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthCtx } from '../auth/auth-ctx.decorator';
import type { AuthContext } from '../auth/auth-context';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { requireRole } from '../auth/role.guard';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantService } from './tenant.service';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenants: TenantService) {}

  /** Bootstrap endpoint — open so the first admin can be created. */
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenants.create(dto);
  }

  /** SUPER_ADMIN: list all tenants with vessel + user counts. */
  @Get()
  @UseGuards(JwtAuthGuard, requireRole('SUPER_ADMIN'))
  findAll() {
    return this.tenants.findAll();
  }

  /** Self-lookup: returns the tenant the JWT belongs to. */
  @Get('self')
  @UseGuards(JwtAuthGuard)
  self(@AuthCtx() auth: AuthContext) {
    return this.tenants.findById(auth.tenantId!);
  }

  /** SUPER_ADMIN: rename a company. */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, requireRole('SUPER_ADMIN'))
  update(@Param('id') id: string, @Body() dto: { name: string }) {
    return this.tenants.update(id, dto.name);
  }
}
