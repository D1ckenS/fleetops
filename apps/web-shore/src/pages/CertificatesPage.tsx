import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, type BadgeColor } from '@fleetops/ui-kit';

// Ship statutory & class certificates — backend P2-1

type CertStatus = 'valid' | 'expiring' | 'expired' | 'pending';

interface ShipCert {
  id: string;
  name: string;
  type: 'Statutory' | 'Class' | 'MGA' | 'Other';
  authority: string;
  issued: string;
  expires: string;
  daysLeft: number;
  status: CertStatus;
}

const CERTS: ShipCert[] = [
  {
    id: 'SC-001',
    name: 'Safety Management Certificate (SMC)',
    type: 'Statutory',
    authority: 'Flag State (NL)',
    issued: '14 Mar 2024',
    expires: '14 Mar 2029',
    daysLeft: 1033,
    status: 'valid',
  },
  {
    id: 'SC-002',
    name: 'Document of Compliance (DOC)',
    type: 'Statutory',
    authority: 'Flag State (NL)',
    issued: '02 Sep 2023',
    expires: '02 Sep 2028',
    daysLeft: 840,
    status: 'valid',
  },
  {
    id: 'SC-003',
    name: 'MARPOL — International Oil Pollution Prevention',
    type: 'Statutory',
    authority: 'DNV',
    issued: '14 Mar 2022',
    expires: '14 Mar 2027',
    daysLeft: 668,
    status: 'valid',
  },
  {
    id: 'SC-004',
    name: 'Load Line Certificate',
    type: 'Statutory',
    authority: 'DNV',
    issued: '14 Mar 2022',
    expires: '14 Mar 2027',
    daysLeft: 668,
    status: 'valid',
  },
  {
    id: 'SC-005',
    name: 'Safety Equipment Certificate',
    type: 'Statutory',
    authority: 'DNV',
    issued: '14 Mar 2022',
    expires: '14 Mar 2027',
    daysLeft: 668,
    status: 'valid',
  },
  {
    id: 'SC-006',
    name: 'Safety Radio Certificate',
    type: 'Statutory',
    authority: 'Flag State (NL)',
    issued: '14 Mar 2024',
    expires: '14 Mar 2025',
    daysLeft: -403,
    status: 'expired',
  },
  {
    id: 'SC-007',
    name: 'ISM — Interim SMC',
    type: 'Statutory',
    authority: 'Flag State (NL)',
    issued: '01 May 2026',
    expires: '01 Nov 2026',
    daysLeft: 169,
    status: 'valid',
  },
  {
    id: 'SC-008',
    name: 'Class Certificate — Hull',
    type: 'Class',
    authority: 'DNV',
    issued: '14 Mar 2022',
    expires: '14 Mar 2027',
    daysLeft: 668,
    status: 'valid',
  },
  {
    id: 'SC-009',
    name: 'Class Certificate — Machinery',
    type: 'Class',
    authority: 'DNV',
    issued: '14 Mar 2022',
    expires: '14 Mar 2027',
    daysLeft: 668,
    status: 'valid',
  },
  {
    id: 'SC-010',
    name: 'Continuous Survey — Machinery (CM)',
    type: 'Class',
    authority: 'DNV',
    issued: '14 Mar 2022',
    expires: '14 Mar 2027',
    daysLeft: 668,
    status: 'valid',
  },
  {
    id: 'SC-011',
    name: 'Thickness Measurement Due',
    type: 'Class',
    authority: 'DNV',
    issued: '—',
    expires: '01 Aug 2026',
    daysLeft: 77,
    status: 'expiring',
  },
  {
    id: 'SC-012',
    name: 'Port State Control — Last inspection',
    type: 'MGA',
    authority: 'MCA (UK)',
    issued: '08 Apr 2026',
    expires: '08 Apr 2027',
    daysLeft: 327,
    status: 'valid',
  },
  {
    id: 'SC-013',
    name: 'MLC — Maritime Labour Certificate',
    type: 'MGA',
    authority: 'Flag State (NL)',
    issued: '11 Mar 2025',
    expires: '11 Mar 2030',
    daysLeft: 1395,
    status: 'valid',
  },
];

const STATUS_COLOR: Record<CertStatus, BadgeColor> = {
  valid: 'green',
  expiring: 'amber',
  expired: 'red',
  pending: 'slate',
};

type Tab = 'all' | 'statutory' | 'class' | 'mga' | 'other';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'statutory', label: 'Statutory' },
  { id: 'class', label: 'Class' },
  { id: 'mga', label: 'MGA / Port' },
  { id: 'other', label: 'Other' },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={
        active
          ? { background: 'var(--ink)', color: '#fff' }
          : {
              background: 'var(--surface)',
              color: 'var(--ink-2)',
              border: '1px solid var(--border)',
            }
      }
      className="h-[22px] px-2 rounded-1 text-[11px] font-medium whitespace-nowrap"
    >
      {children}
    </button>
  );
}

export function CertificatesPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'all';
  const [filter, setFilter] = useState<'all' | 'expiring' | 'expired'>('all');

  const setTab = (t: Tab) => setParams(t === 'all' ? {} : { tab: t });

  const visible = CERTS.filter((c) => {
    const typeMatch =
      tab === 'all' || c.type.toLowerCase() === tab || (tab === 'mga' && c.type === 'MGA');
    const statusMatch = filter === 'all' || c.status === filter;
    return typeMatch && statusMatch;
  });

  const expiring = CERTS.filter((c) => c.status === 'expiring').length;
  const expired = CERTS.filter((c) => c.status === 'expired').length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'var(--bg)',
      }}
    >
      {/* Sub-header */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 flex-wrap"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <h1
          className="text-[16px] font-semibold m-0"
          style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
        >
          Certificates
        </h1>
        <span className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
          MV HALCYON · {CERTS.length} on file
        </span>
        {expiring > 0 && <Badge color="amber">{expiring} expiring</Badge>}
        {expired > 0 && <Badge color="red">{expired} expired</Badge>}
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + Upload certificate
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-0 flex-shrink-0 px-4 overflow-x-auto"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        {TABS.map((t) => {
          const count =
            t.id === 'all'
              ? CERTS.length
              : CERTS.filter(
                  (c) => c.type.toLowerCase() === t.id || (t.id === 'mga' && c.type === 'MGA'),
                ).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0"
              style={
                tab === t.id
                  ? { borderBottomColor: 'var(--navy)', color: 'var(--navy)', marginBottom: -1 }
                  : { borderBottomColor: 'transparent', color: 'var(--ink-3)' }
              }
            >
              <span>{t.label}</span>
              <span
                className="font-mono text-[10.5px] px-1.5 py-px rounded-[10px]"
                style={{
                  background: tab === t.id ? 'var(--navy)' : 'var(--surface-2)',
                  color: tab === t.id ? '#fff' : 'var(--ink-3)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-4 py-2 flex-shrink-0 flex-wrap"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)' }}
      >
        <span
          className="text-[10.5px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          Status
        </span>
        <div className="flex gap-1.5">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          <Chip active={filter === 'expiring'} onClick={() => setFilter('expiring')}>
            Expiring
          </Chip>
          <Chip active={filter === 'expired'} onClick={() => setFilter('expired')}>
            Expired
          </Chip>
        </div>
        <div className="flex-1" />
        <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
          {visible.length} certificates
        </span>
      </div>

      {/* Column headers */}
      <div
        className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
        style={{
          gridTemplateColumns: '80px 1fr 120px 160px 100px 100px 70px 70px',
          background: 'var(--surface-sunk)',
          color: 'var(--ink-3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span>Ref</span>
        <span>Certificate</span>
        <span>Type</span>
        <span>Authority</span>
        <span>Issued</span>
        <span>Expires</span>
        <span>Days</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
        {visible.length === 0 && (
          <div className="p-10 text-center text-xs" style={{ color: 'var(--ink-3)' }}>
            No certificates found.
          </div>
        )}
        {visible.map((c) => (
          <div
            key={c.id}
            className="grid gap-2 px-4 py-2.5 items-center"
            style={{
              gridTemplateColumns: '80px 1fr 120px 160px 100px 100px 70px 70px',
              borderTop: '1px solid var(--hairline)',
            }}
          >
            <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
              {c.id}
            </span>
            <span className="text-[12.5px] font-medium truncate" style={{ color: 'var(--ink)' }}>
              {c.name}
            </span>
            <Badge
              color={
                c.type === 'Statutory'
                  ? 'blue'
                  : c.type === 'Class'
                    ? 'purple'
                    : c.type === 'MGA'
                      ? 'slate'
                      : 'slate'
              }
            >
              {c.type.toUpperCase()}
            </Badge>
            <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
              {c.authority}
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
              {c.issued}
            </span>
            <span
              className="font-mono text-[11px]"
              style={{
                color:
                  c.status === 'expired'
                    ? 'var(--sig-red)'
                    : c.status === 'expiring'
                      ? 'var(--sig-amber)'
                      : 'var(--ink-2)',
              }}
            >
              {c.expires}
            </span>
            <Badge color={STATUS_COLOR[c.status]}>
              {c.daysLeft < 0 ? `${Math.abs(c.daysLeft)} d ago` : `${c.daysLeft} d`}
            </Badge>
            <button
              className="px-2.5 py-1 rounded-2 border text-[11px] font-medium justify-self-end"
              style={{
                borderColor: 'var(--border)',
                color:
                  c.status === 'expired' || c.status === 'expiring'
                    ? 'var(--sig-red)'
                    : 'var(--ink-2)',
                cursor: 'pointer',
              }}
            >
              {c.status === 'expired' ? 'Renew' : 'Open'}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-3 px-4 py-2 flex-shrink-0 text-[11.5px]"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          color: 'var(--ink-2)',
        }}
      >
        <span>
          <b className="font-mono" style={{ color: 'var(--ink)' }}>
            {CERTS.length}
          </b>{' '}
          total
        </span>
        <span style={{ color: 'var(--hairline)' }}>·</span>
        <span>
          <b className="font-mono" style={{ color: 'var(--sig-green)' }}>
            {CERTS.filter((c) => c.status === 'valid').length}
          </b>{' '}
          valid
        </span>
        <span style={{ color: 'var(--hairline)' }}>·</span>
        <span>
          <b className="font-mono" style={{ color: 'var(--sig-amber)' }}>
            {expiring}
          </b>{' '}
          expiring
        </span>
        <span style={{ color: 'var(--hairline)' }}>·</span>
        <span>
          <b className="font-mono" style={{ color: 'var(--sig-red)' }}>
            {expired}
          </b>{' '}
          expired
        </span>
        <div className="flex-1" />
        <span style={{ color: 'var(--ink-3)' }}>Next survey due</span>
        <span className="font-mono font-semibold" style={{ color: 'var(--ink)' }}>
          01 Aug 2026
        </span>
      </div>
    </div>
  );
}
