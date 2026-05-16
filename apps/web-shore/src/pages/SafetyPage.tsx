import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, type BadgeColor } from '@fleetops/ui-kit';

// ISM safety management — backend P2-2

type Severity = 'high' | 'medium' | 'low';
type RecordStatus = 'open' | 'under-review' | 'closed';

interface SafetyRecord {
  id: string;
  date: string;
  title: string;
  location: string;
  reportedBy: string;
  severity: Severity;
  status: RecordStatus;
  capaRef: string | null;
}

const INCIDENTS: SafetyRecord[] = [
  {
    id: 'INC-0042',
    date: '08 May 2026',
    title: 'Slip on engine room grating — no injury',
    location: 'Engine room',
    reportedBy: 'Oiler Reyes',
    severity: 'medium',
    status: 'under-review',
    capaRef: 'CAPA-0088',
  },
  {
    id: 'INC-0041',
    date: '24 Apr 2026',
    title: 'Minor chemical spill — lubricating oil',
    location: 'Purifier room',
    reportedBy: '2/E Park',
    severity: 'low',
    status: 'closed',
    capaRef: 'CAPA-0085',
  },
  {
    id: 'INC-0040',
    date: '11 Apr 2026',
    title: 'Near-miss: unsecured toolbox on catwalk',
    location: 'Main deck',
    reportedBy: 'Bosun M.',
    severity: 'medium',
    status: 'closed',
    capaRef: 'CAPA-0082',
  },
];

const NEAR_MISSES: SafetyRecord[] = [
  {
    id: 'NM-0031',
    date: '06 May 2026',
    title: 'Line under tension — snap-back zone entered',
    location: 'Mooring deck',
    reportedBy: 'AB Bautista',
    severity: 'high',
    status: 'open',
    capaRef: null,
  },
  {
    id: 'NM-0030',
    date: '28 Apr 2026',
    title: 'Unsecured valve handle fell from above',
    location: 'Engine room',
    reportedBy: 'Oiler Reyes',
    severity: 'medium',
    status: 'under-review',
    capaRef: 'CAPA-0087',
  },
  {
    id: 'NM-0029',
    date: '17 Apr 2026',
    title: 'CO2 alarm — galley extractor fire (no fire)',
    location: 'Galley',
    reportedBy: 'Cook Wong',
    severity: 'medium',
    status: 'closed',
    capaRef: 'CAPA-0083',
  },
  {
    id: 'NM-0028',
    date: '08 Apr 2026',
    title: 'Unlit area on boat deck at night',
    location: 'Boat deck',
    reportedBy: 'OS Schmidt',
    severity: 'low',
    status: 'closed',
    capaRef: null,
  },
];

const OBSERVATIONS: SafetyRecord[] = [
  {
    id: 'OBS-0118',
    date: '11 May 2026',
    title: 'PPE not worn — grinding in bilge',
    location: 'Bilge',
    reportedBy: 'C/E Aalto',
    severity: 'medium',
    status: 'open',
    capaRef: null,
  },
  {
    id: 'OBS-0117',
    date: '04 May 2026',
    title: 'Fire door held open with wedge',
    location: 'Accommodation',
    reportedBy: 'Master',
    severity: 'high',
    status: 'under-review',
    capaRef: 'CAPA-0086',
  },
  {
    id: 'OBS-0116',
    date: '28 Apr 2026',
    title: 'SCBA bottle below min pressure',
    location: 'Muster station A',
    reportedBy: '3/O Mokoena',
    severity: 'high',
    status: 'closed',
    capaRef: 'CAPA-0084',
  },
  {
    id: 'OBS-0115',
    date: '20 Apr 2026',
    title: 'Loose handrail — fwd stairwell',
    location: 'Accommodation',
    reportedBy: 'Cadet Brandt',
    severity: 'medium',
    status: 'closed',
    capaRef: null,
  },
];

const SEV_COLOR: Record<Severity, BadgeColor> = { high: 'red', medium: 'amber', low: 'slate' };
const STATUS_COLOR: Record<RecordStatus, BadgeColor> = {
  open: 'red',
  'under-review': 'amber',
  closed: 'green',
};

const STATUS_LABEL: Record<RecordStatus, string> = {
  open: 'Open',
  'under-review': 'Under review',
  closed: 'Closed',
};

type Tab = 'incidents' | 'near-misses' | 'observations' | 'non-conformities';

const TABS: { id: Tab; label: string; data: SafetyRecord[] }[] = [
  { id: 'incidents', label: 'Incidents', data: INCIDENTS },
  { id: 'near-misses', label: 'Near Misses', data: NEAR_MISSES },
  { id: 'observations', label: 'Observations', data: OBSERVATIONS },
  { id: 'non-conformities', label: 'Non-Conformities', data: [] },
];

function RecordTable({ records, emptyLabel }: { records: SafetyRecord[]; emptyLabel: string }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
        style={{
          gridTemplateColumns: '90px 100px 1fr 130px 100px 90px 100px 80px',
          background: 'var(--surface-sunk)',
          color: 'var(--ink-3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span>Ref</span>
        <span>Date</span>
        <span>Description</span>
        <span>Location</span>
        <span>Reported by</span>
        <span>Severity</span>
        <span>Status</span>
        <span>CAPA</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
        {records.length === 0 ? (
          <div className="p-10 text-center text-xs" style={{ color: 'var(--ink-3)' }}>
            {emptyLabel}
          </div>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              className="grid gap-2 px-4 py-2.5 items-center"
              style={{
                gridTemplateColumns: '90px 100px 1fr 130px 100px 90px 100px 80px',
                borderTop: '1px solid var(--hairline)',
              }}
            >
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
                {r.id}
              </span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                {r.date}
              </span>
              <span className="text-[12.5px] font-medium truncate" style={{ color: 'var(--ink)' }}>
                {r.title}
              </span>
              <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                {r.location}
              </span>
              <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                {r.reportedBy}
              </span>
              <Badge color={SEV_COLOR[r.severity]}>{r.severity.toUpperCase()}</Badge>
              <Badge color={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Badge>
              <span
                className="font-mono text-[11px]"
                style={{ color: r.capaRef ? 'var(--sig-blue)' : 'var(--ink-4)' }}
              >
                {r.capaRef ?? '—'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SafetyPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'incidents';

  const setTab = (t: Tab) => setParams(t === 'incidents' ? {} : { tab: t });
  const current = TABS.find((t) => t.id === tab) ?? TABS[0]!;

  const openCount = [...INCIDENTS, ...NEAR_MISSES, ...OBSERVATIONS].filter(
    (r) => r.status === 'open',
  ).length;

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
          Safety
        </h1>
        <span className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
          MV HALCYON · ISM 2006
        </span>
        {openCount > 0 && <Badge color="amber">{openCount} open</Badge>}
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + Report
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-0 flex-shrink-0 px-4 overflow-x-auto"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        {TABS.map((t) => (
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
              {t.data.length}
            </span>
          </button>
        ))}
      </div>

      <RecordTable records={current?.data ?? []} emptyLabel="No non-conformities on file." />
    </div>
  );
}
