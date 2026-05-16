import { useSearchParams } from 'react-router-dom';
import { Badge, type BadgeColor } from '@fleetops/ui-kit';

// QHSE — Quality, Health, Safety & Environment — backend P2-3

type InspStatus = 'scheduled' | 'completed' | 'overdue';
type FindingStatus = 'open' | 'in-progress' | 'closed';

interface Inspection {
  id: string;
  date: string;
  type: string;
  authority: string;
  scope: string;
  findings: number;
  status: InspStatus;
}

interface Capa {
  id: string;
  ref: string;
  source: string;
  description: string;
  owner: string;
  due: string;
  daysLeft: number;
  status: FindingStatus;
}

const INSPECTIONS: Inspection[] = [
  {
    id: 'IN-0022',
    date: '08 Apr 2026',
    type: 'Port State Control',
    authority: 'MCA (UK)',
    scope: 'Full ship',
    findings: 0,
    status: 'completed',
  },
  {
    id: 'IN-0021',
    date: '14 Mar 2026',
    type: 'Flag State Annual Survey',
    authority: 'Flag State (NL)',
    scope: 'ISM / Documentation',
    findings: 2,
    status: 'completed',
  },
  {
    id: 'IN-0020',
    date: '11 Feb 2026',
    type: 'DNV Class Renewal',
    authority: 'DNV',
    scope: 'Hull + Machinery',
    findings: 1,
    status: 'completed',
  },
  {
    id: 'IN-0019',
    date: '01 Aug 2026',
    type: 'DNV Continuous Survey (CM)',
    authority: 'DNV',
    scope: 'Machinery space',
    findings: 0,
    status: 'scheduled',
  },
  {
    id: 'IN-0018',
    date: '14 Jul 2026',
    type: 'Dry-dock survey',
    authority: 'DNV',
    scope: 'Hull underwater',
    findings: 0,
    status: 'scheduled',
  },
];

const CAPAS: Capa[] = [
  {
    id: 'CAPA-0088',
    ref: 'INC-0042',
    source: 'Incident',
    description: 'Install anti-slip mat on ER grating at FR 48',
    owner: 'C/E Aalto',
    due: '25 May 2026',
    daysLeft: 9,
    status: 'in-progress',
  },
  {
    id: 'CAPA-0087',
    ref: 'NM-0030',
    source: 'Near miss',
    description: 'Fit locking collar on valve hand wheel EV-007',
    owner: '2/E Park',
    due: '20 May 2026',
    daysLeft: 4,
    status: 'in-progress',
  },
  {
    id: 'CAPA-0086',
    ref: 'OBS-0117',
    source: 'Observation',
    description: 'Replace fire door closer spring — deck 3 alley',
    owner: 'Bosun M.',
    due: '15 May 2026',
    daysLeft: -1,
    status: 'open',
  },
  {
    id: 'CAPA-0085',
    ref: 'INC-0041',
    source: 'Incident',
    description: 'Chemical spill kit restocked + procedure posted',
    owner: 'Bosun M.',
    due: '01 May 2026',
    daysLeft: -15,
    status: 'closed',
  },
  {
    id: 'CAPA-0084',
    ref: 'OBS-0116',
    source: 'Observation',
    description: 'SCBA cylinders recharged + monthly check log',
    owner: '2/E Park',
    due: '28 Apr 2026',
    daysLeft: -18,
    status: 'closed',
  },
  {
    id: 'CAPA-0083',
    ref: 'NM-0029',
    source: 'Near miss',
    description: 'Extractor fan service + CO2 sensor calibrated',
    owner: 'Cook Wong',
    due: '26 Apr 2026',
    daysLeft: -20,
    status: 'closed',
  },
  {
    id: 'CAPA-0082',
    ref: 'INC-0040',
    source: 'Incident',
    description: 'Tool stowage audit + securing hooks fitted',
    owner: 'Bosun M.',
    due: '22 Apr 2026',
    daysLeft: -24,
    status: 'closed',
  },
];

const INSP_COLOR: Record<InspStatus, BadgeColor> = {
  completed: 'green',
  scheduled: 'blue',
  overdue: 'red',
};
const CAPA_COLOR: Record<FindingStatus, BadgeColor> = {
  open: 'red',
  'in-progress': 'amber',
  closed: 'green',
};

type Tab = 'inspections' | 'capas';

export function QHSEPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'inspections';
  const setTab = (t: Tab) => setParams(t === 'inspections' ? {} : { tab: t });

  const openCapas = CAPAS.filter((c) => c.status !== 'closed').length;

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
          QHSE
        </h1>
        <span className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
          MV HALCYON · ISO 9001 / ISM
        </span>
        {openCapas > 0 && <Badge color="amber">{openCapas} open CAPAs</Badge>}
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + New CAPA
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-0 flex-shrink-0 px-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        {[
          { id: 'inspections' as Tab, label: 'Inspections & Audits', count: INSPECTIONS.length },
          { id: 'capas' as Tab, label: 'CAPAs', count: CAPAS.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap"
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
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Inspections tab */}
      {tab === 'inspections' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div
            className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '80px 100px 1fr 140px 160px 80px 100px',
              background: 'var(--surface-sunk)',
              color: 'var(--ink-3)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Ref</span>
            <span>Date</span>
            <span>Type</span>
            <span>Authority</span>
            <span>Scope</span>
            <span className="text-right">Findings</span>
            <span>Status</span>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
            {INSPECTIONS.map((i) => (
              <div
                key={i.id}
                className="grid gap-2 px-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: '80px 100px 1fr 140px 160px 80px 100px',
                  borderTop: '1px solid var(--hairline)',
                }}
              >
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
                  {i.id}
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {i.date}
                </span>
                <span className="text-[12.5px] font-medium" style={{ color: 'var(--ink)' }}>
                  {i.type}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                  {i.authority}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                  {i.scope}
                </span>
                <span
                  className="font-mono text-[12px] text-right font-semibold"
                  style={{ color: i.findings > 0 ? 'var(--sig-amber)' : 'var(--ink-3)' }}
                >
                  {i.findings}
                </span>
                <Badge color={INSP_COLOR[i.status]}>
                  {i.status.charAt(0).toUpperCase() + i.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAPAs tab */}
      {tab === 'capas' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div
            className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '90px 80px 100px 1fr 110px 100px 70px 100px',
              background: 'var(--surface-sunk)',
              color: 'var(--ink-3)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>CAPA</span>
            <span>Ref</span>
            <span>Source</span>
            <span>Description</span>
            <span>Owner</span>
            <span>Due</span>
            <span>Days</span>
            <span>Status</span>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
            {CAPAS.map((c) => (
              <div
                key={c.id}
                className="grid gap-2 px-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: '90px 80px 100px 1fr 110px 100px 70px 100px',
                  borderTop: '1px solid var(--hairline)',
                }}
              >
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
                  {c.id}
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--sig-blue)' }}>
                  {c.ref}
                </span>
                <Badge
                  color={
                    c.source === 'Incident' ? 'red' : c.source === 'Near miss' ? 'amber' : 'slate'
                  }
                >
                  {c.source.toUpperCase()}
                </Badge>
                <span className="text-[12px] truncate" style={{ color: 'var(--ink)' }}>
                  {c.description}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                  {c.owner}
                </span>
                <span
                  className="font-mono text-[11px]"
                  style={{
                    color:
                      c.daysLeft < 0 && c.status !== 'closed' ? 'var(--sig-red)' : 'var(--ink-2)',
                  }}
                >
                  {c.due}
                </span>
                <span
                  className="font-mono text-[11px] text-right"
                  style={{
                    color:
                      c.daysLeft < 0
                        ? 'var(--sig-red)'
                        : c.daysLeft < 7
                          ? 'var(--sig-amber)'
                          : 'var(--ink-3)',
                  }}
                >
                  {c.status === 'closed'
                    ? '✓'
                    : c.daysLeft < 0
                      ? `${Math.abs(c.daysLeft)} d`
                      : `${c.daysLeft} d`}
                </span>
                <Badge color={CAPA_COLOR[c.status]}>
                  {c.status === 'in-progress'
                    ? 'In progress'
                    : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
