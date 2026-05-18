import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generators, Issuer } from 'openid-client';
import type { Client } from 'openid-client';
import { newId } from '@fleetops/domain';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

interface OidcStatePayload {
  type: 'oidc_state';
  tenantId: string;
  codeVerifier: string;
  nonce: string;
}

// Cache discovered OIDC clients keyed by Entra tenant ID — avoids repeated HTTP
// discovery calls on every login attempt.
const clientCache = new Map<string, Client>();

@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly users: UserService,
    private readonly jwt: JwtService,
  ) {}

  async beginLogin(fleetopsTenantId: string): Promise<{ authorizationUrl: string; state: string }> {
    const config = await this.loadConfig(fleetopsTenantId);
    const client = await this.getClient(
      config.entraClientId,
      config.entraTenantId,
      config.clientSecret,
      config.redirectUri,
    );

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const nonce = generators.nonce();

    const statePayload: OidcStatePayload = {
      type: 'oidc_state',
      tenantId: fleetopsTenantId,
      codeVerifier,
      nonce,
    };
    // State is signed as a short-lived RS256 JWT (10 min); carries codeVerifier for PKCE.
    const state = this.jwt.sign(statePayload, { expiresIn: 600 });

    const authorizationUrl = client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      nonce,
      state,
    });

    return { authorizationUrl, state };
  }

  async completeLogin(code: string, state: string) {
    let statePayload: OidcStatePayload;
    try {
      statePayload = this.jwt.verify<OidcStatePayload>(state);
    } catch {
      throw new UnauthorizedException('Invalid or expired OIDC state token');
    }
    if (statePayload.type !== 'oidc_state') {
      throw new UnauthorizedException('Unexpected token type in OIDC state');
    }

    const { tenantId, codeVerifier, nonce } = statePayload;
    const config = await this.loadConfig(tenantId);
    const client = await this.getClient(
      config.entraClientId,
      config.entraTenantId,
      config.clientSecret,
      config.redirectUri,
    );

    const tokenSet = await client.callback(
      config.redirectUri,
      { code, state },
      { code_verifier: codeVerifier, nonce, state },
    );

    const claims = tokenSet.claims();
    const email = (claims['email'] ?? claims['preferred_username']) as string | undefined;
    if (!email) throw new UnauthorizedException('No email claim in Microsoft ID token');

    // Find existing user or provision a new SSO-only user (no password).
    let user: {
      id: string;
      tenantId: string | null;
      vesselId?: string | null;
      email: string;
      username?: string | null;
      role: string;
    };
    try {
      user = await this.users.findByIdentifier(tenantId, email);
    } catch {
      const id = newId();
      const username = email.split('@')[0] ?? 'sso-user';
      user = await this.prisma.withTenant(tenantId, (tx) =>
        tx.user.create({
          data: { id, tenantId, email, username, passwordHash: null, role: 'CREW' },
        }),
      );
      this.logger.log({ msg: 'SSO: provisioned new user', tenantId, email });
    }

    return this.auth.issueTokens(user);
  }

  // ── Config & client helpers ────────────────────────────────────────────────

  async getSsoConfig(tenantId: string) {
    try {
      return await this.loadConfig(tenantId);
    } catch {
      return null;
    }
  }

  async upsertSsoConfig(
    tenantId: string,
    dto: {
      entraClientId: string;
      entraTenantId: string;
      clientSecret: string;
      redirectUri: string;
      enabled?: boolean;
    },
  ) {
    // Invalidate cached client when config changes.
    clientCache.delete(dto.entraTenantId);

    return this.prisma.withTenant(tenantId, (tx) =>
      tx.tenantSsoConfig.upsert({
        where: { tenantId },
        create: { id: newId(), tenantId, ...dto, enabled: dto.enabled ?? true },
        update: { ...dto },
      }),
    );
  }

  private async loadConfig(tenantId: string) {
    const config = await this.prisma.withTenant(tenantId, (tx) =>
      tx.tenantSsoConfig.findFirst({ where: { tenantId, enabled: true } }),
    );
    if (!config) {
      throw new ServiceUnavailableException(
        'SSO is not configured for this tenant. Set up Microsoft Entra credentials in the Integrations settings.',
      );
    }
    return config;
  }

  private async getClient(
    clientId: string,
    entraTenantId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<Client> {
    const cacheKey = `${entraTenantId}:${clientId}`;
    if (clientCache.has(cacheKey)) return clientCache.get(cacheKey)!;

    const issuer = await Issuer.discover(`https://login.microsoftonline.com/${entraTenantId}/v2.0`);
    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUri],
      response_types: ['code'],
    });
    clientCache.set(cacheKey, client);
    return client;
  }
}
