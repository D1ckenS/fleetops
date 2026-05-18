import { Injectable } from '@nestjs/common';
import type { PurchaseOrder, POLine, Supplier, Vessel } from '@prisma/client';

type PoWithRelations = PurchaseOrder & {
  supplier: Pick<Supplier, 'name' | 'contactEmail'> | null;
  vessel: Pick<Vessel, 'name'>;
  lines: Pick<POLine, 'description' | 'quantity' | 'unitPrice' | 'totalPrice' | 'currency'>[];
};
import { newId } from '@fleetops/domain';
import type { AuthContext } from '../auth/auth-context';
import { PrismaService } from '../prisma/prisma.service';

type ExportFormat = 'csv' | 'exact';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  getConfig(auth: AuthContext) {
    return this.prisma.withTenant(auth.tenantId!, (tx) =>
      tx.accountingConnector.findFirst({ where: { tenantId: auth.tenantId! } }),
    );
  }

  upsertConfig(
    auth: AuthContext,
    dto: { provider: string; config?: Record<string, unknown>; enabled?: boolean },
  ) {
    return this.prisma.withTenant(auth.tenantId!, (tx) =>
      tx.accountingConnector.upsert({
        where: { tenantId: auth.tenantId! },
        create: {
          id: newId(),
          tenantId: auth.tenantId!,
          provider: dto.provider as never,
          config: (dto.config as never) ?? {},
          enabled: dto.enabled ?? true,
        },
        update: {
          provider: dto.provider as never,
          ...(dto.config !== undefined && { config: dto.config as never }),
          ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        },
      }),
    );
  }

  async exportPos(
    auth: AuthContext,
    from: string,
    to: string,
    format: ExportFormat,
  ): Promise<string> {
    const pos: PoWithRelations[] = await this.prisma.withTenant(auth.tenantId!, (tx) =>
      tx.purchaseOrder.findMany({
        where: {
          tenantId: auth.tenantId!,
          deletedAt: null,
          status: { notIn: ['DRAFT'] },
          createdAt: { gte: new Date(from), lte: new Date(`${to}T23:59:59Z`) },
        },
        include: {
          supplier: { select: { name: true, contactEmail: true } },
          vessel: { select: { name: true } },
          lines: {
            where: { deletedAt: null },
            select: {
              description: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              currency: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    );

    if (format === 'csv') return this.toCsv(pos);
    return this.toExactOnline(pos);
  }

  // ── Formatters ─────────────────────────────────────────────────────────────

  private toCsv(pos: PoWithRelations[]) {
    const header = 'PO Number,Title,Status,Supplier,Vessel,Total Amount,Currency,Created Date';
    const rows = pos.map((p) =>
      [
        p.poNumber ?? '',
        `"${p.title.replace(/"/g, '""')}"`,
        p.status,
        `"${(p.supplier?.name ?? '').replace(/"/g, '""')}"`,
        `"${p.vessel.name.replace(/"/g, '""')}"`,
        p.totalAmount.toString(),
        p.currency,
        p.createdAt.toISOString().split('T')[0],
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }

  private toExactOnline(pos: PoWithRelations[]) {
    // Exact Online purchase journal import format (simplified XML).
    const lines = pos
      .map(
        (po) => `  <PurchaseEntry>
    <Journal>20</Journal>
    <EntryDate>${po.createdAt.toISOString().split('T')[0]}</EntryDate>
    <ExternalLinkDescription>${po.poNumber ?? po.id}</ExternalLinkDescription>
    <Supplier>${po.supplier?.name ?? 'Unknown'}</Supplier>
    <Lines>
${po.lines
  .map(
    (l) => `      <Line>
        <Description>${l.description}</Description>
        <Quantity>${l.quantity}</Quantity>
        <UnitPrice>${l.unitPrice}</UnitPrice>
        <AmountDC>${l.totalPrice}</AmountDC>
        <Currency>${l.currency}</Currency>
      </Line>`,
  )
  .join('\n')}
    </Lines>
  </PurchaseEntry>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<ExactOnlineImport xmlns="urn:exact:finance:purchase:v1" version="1.0">
${lines}
</ExactOnlineImport>`;
  }
}
