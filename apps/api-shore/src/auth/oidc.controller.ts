import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthCtx } from './auth-ctx.decorator';
import type { AuthContext } from './auth-context';
import { OidcService } from './oidc.service';

class OidcCallbackDto {
  @IsString()
  code!: string;

  @IsString()
  state!: string;
}

class UpsertSsoConfigDto {
  @IsString()
  entraClientId!: string;

  @IsString()
  entraTenantId!: string;

  @IsString()
  clientSecret!: string;

  @IsString()
  redirectUri!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

@Controller('auth/oidc')
export class OidcController {
  constructor(private readonly oidc: OidcService) {}

  /** Begin the OIDC login flow. Returns the IDP authorization URL + state. */
  @Get('login')
  beginLogin(@Query('tenantId') tenantId: string) {
    return this.oidc.beginLogin(tenantId);
  }

  /** Complete the OIDC flow. Exchange code+state for FleetOps JWT pair. */
  @Post('callback')
  callback(@Body() dto: OidcCallbackDto) {
    return this.oidc.completeLogin(dto.code, dto.state);
  }

  /** Get current SSO config for the caller's tenant (admins only). */
  @UseGuards(JwtAuthGuard)
  @Get('config')
  getConfig(@AuthCtx() auth: AuthContext) {
    return this.oidc.getSsoConfig(auth.tenantId!);
  }

  /** Upsert SSO config for the caller's tenant (admins only). */
  @UseGuards(JwtAuthGuard)
  @Post('config')
  upsertConfig(@AuthCtx() auth: AuthContext, @Body() dto: UpsertSsoConfigDto) {
    return this.oidc.upsertSsoConfig(auth.tenantId!, dto);
  }
}
