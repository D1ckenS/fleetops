import { useSearchParams } from 'react-router-dom';
import { Badge, type BadgeColor } from '@fleetops/ui-kit';

// FLGO — Fleet & Logistics Operations — backend P3-1

interface Voyage {
  id: string;
  vessel: string;
  departure: string;
  depPort: string;
  arrival: string;
  arrPort: string;
  cargo: string;
  distance: string;
  status: 'completed' | 'active' | 'planned';
  cii: 'A' | 'B' | 'C' | 'D' | 'E';
}

interface FuelRecord {
  id: string;
  date: string;
  port: string;
  grade: string;
  quantity: string;
  unit: string;
  supplier: string;
  bunkerSurveyor: string;
}

const VOYAGES: Voyage[] = [
  {
    id: 'VY-2026-18',
    vessel: 'MV HALCYON',
    departure: '02 May 2026',
    depPort: 'Rotterdam (NL)',
    arrival: '11 May 2026',
    arrPort: 'Singapore (SG)',
    cargo: 'General cargo — 18 400 t',
    distance: '8 420 nm',
    status: 'active',
    cii: 'B',
  },
  {
    id: 'VY-2026-17',
    vessel: 'MV HALCYON',
    departure: '12 Apr 2026',
    depPort: 'Houston (US)',
    arrival: '01 May 2026',
    arrPort: 'Rotterdam (NL)',
    cargo: 'Bulk grain — 22 100 t',
    distance: '5 210 nm',
    status: 'completed',
    cii: 'A',
  },
  {
    id: 'VY-2026-16',
    vessel: 'MV HALCYON',
    departure: '14 Mar 2026',
    depPort: 'Yokohama (JP)',
    arrival: '10 Apr 2026',
    arrPort: 'Houston (US)',
    cargo: 'Steel coils — 14 800 t',
    distance: '9 180 nm',
    status: 'completed',
    cii: 'B',
  },
  {
    id: 'VY-2026-19',
    vessel: 'MV HALCYON',
    departure: '15 May 2026',
    depPort: 'Singapore (SG)',
    arrival: '28 May 2026',
    arrPort: 'Port Klang (MY)',
    cargo: 'Container — 12 000 t',
    distance: '1 080 nm',
    status: 'planned',
    cii: 'A',
  },
];

const BUNKERS: FuelRecord[] = [
  {
    id: 'BK-0142',
    date: '02 May 2026',
    port: 'Rotterdam (NL)',
    grade: 'VLSFO 0.5%',
    quantity: '1 240.8',
    unit: 'MT',
    supplier: 'Shell Marine',
    bunkerSurveyor: 'SGS Rotterdam',
  },
  {
    id: 'BK-0141',
    date: '12 Apr 2026',
    port: 'Houston (US)',
    grade: 'VLSFO 0.5%',
    quantity: '980.4',
    unit: 'MT',
    supplier: 'Chevron Marine',
    bunkerSurveyor: 'Saybolt Houston',
  },
  {
    id: 'BK-0140',
    date: '14 Mar 2026',
    port: 'Yokohama (JP)',
    grade: 'MGO 0.1%',
    quantity: '142.2',
    unit: 'MT',
    supplier: 'Cosmo Oil',
    bunkerSurveyor: 'BV Yokohama',
  },
  {
    id: 'BK-0139',
    date: '20 Feb 2026',
    port: 'Singapore (SG)',
    grade: 'VLSFO 0.5%',
    quantity: '1 480.0',
    unit: 'MT',
    supplier: 'ExxonMobil Marine',
    bunkerSurveyor: 'Intertek Singapore',
  },
];

const STATUS_COLOR: Record<string, BadgeColor> = {
  completed: 'green',
  active: 'blue',
  planned: 'slate',
};
const CII_COLOR: Record<string, BadgeColor> = {
  A: 'green',
  B: 'green',
  C: 'amber',
  D: 'red',
  E: 'red',
};

type Tab = 'voyages' | 'bunkers';

export function FlgoPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'voyages';
  const setTab = (t: Tab) => setParams(t === 'voyages' ? {} : { tab: t });

  const activeVoyage = VOYAGES.find((v) => v.status === 'active');

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
          FLGO
        </h1>
        <span className="text-[12px]" style={{ color: 'var(--ink-3)' }}>
          MV HALCYON · Fleet & Logistics
        </span>
        {activeVoyage && <Badge color="blue">Voyage {activeVoyage.id} active</Badge>}
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + New voyage
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-0 flex-shrink-0 px-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        {[
          { id: 'voyages' as Tab, label: 'Voyage log', count: VOYAGES.length },
          { id: 'bunkers' as Tab, label: 'Bunker records', count: BUNKERS.length },
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

      {/* Voyages */}
      {tab === 'voyages' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div
            className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '90px 90px 140px 90px 140px 1fr 80px 60px 80px',
              background: 'var(--surface-sunk)',
              color: 'var(--ink-3)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Voyage</span>
            <span>Departed</span>
            <span>From</span>
            <span>Arrived</span>
            <span>To</span>
            <span>Cargo</span>
            <span>Distance</span>
            <span>CII</span>
            <span>Status</span>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
            {VOYAGES.map((v) => (
              <div
                key={v.id}
                className="grid gap-2 px-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: '90px 90px 140px 90px 140px 1fr 80px 60px 80px',
                  borderTop: '1px solid var(--hairline)',
                }}
              >
                <span
                  className="font-mono text-[11.5px] font-medium"
                  style={{ color: 'var(--ink)' }}
                >
                  {v.id}
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {v.departure.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[11.5px] truncate" style={{ color: 'var(--ink-2)' }}>
                  {v.depPort}
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {v.arrival.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="text-[11.5px] truncate" style={{ color: 'var(--ink-2)' }}>
                  {v.arrPort}
                </span>
                <span className="text-[11.5px] truncate" style={{ color: 'var(--ink-2)' }}>
                  {v.cargo}
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {v.distance}
                </span>
                <Badge color={CII_COLOR[v.cii] ?? 'slate'}>CII {v.cii}</Badge>
                <Badge color={STATUS_COLOR[v.status] ?? 'slate'}>
                  {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                </Badge>
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
                4
              </b>{' '}
              voyages YTD
            </span>
            <span style={{ color: 'var(--hairline)' }}>·</span>
            <span>
              <b className="font-mono" style={{ color: 'var(--ink)' }}>
                23 810
              </b>{' '}
              nm total
            </span>
            <div className="flex-1" />
            <span style={{ color: 'var(--ink-3)' }}>Fleet avg CII</span>
            <Badge color="green">CII A</Badge>
          </div>
        </div>
      )}

      {/* Bunkers */}
      {tab === 'bunkers' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div
            className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '80px 100px 140px 100px 90px 50px 150px 1fr',
              background: 'var(--surface-sunk)',
              color: 'var(--ink-3)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Ref</span>
            <span>Date</span>
            <span>Port</span>
            <span>Grade</span>
            <span className="text-right">Quantity</span>
            <span>Unit</span>
            <span>Supplier</span>
            <span>Surveyor</span>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
            {BUNKERS.map((b) => (
              <div
                key={b.id}
                className="grid gap-2 px-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: '80px 100px 140px 100px 90px 50px 150px 1fr',
                  borderTop: '1px solid var(--hairline)',
                }}
              >
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
                  {b.id}
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {b.date}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                  {b.port}
                </span>
                <Badge color={b.grade.includes('MGO') ? 'blue' : 'slate'}>{b.grade}</Badge>
                <span
                  className="font-mono text-[12px] font-semibold text-right"
                  style={{ color: 'var(--ink)' }}
                >
                  {b.quantity}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {b.unit}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                  {b.supplier}
                </span>
                <span className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
                  {b.bunkerSurveyor}
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex items-center gap-3 px-4 py-2 flex-shrink-0 text-[11.5px]"
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              color: 'var(--ink-2)',
            }}
          >
            <span>Total bunkered YTD</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--ink)' }}>
              3 843.4 MT
            </span>
            <div className="flex-1" />
            <span style={{ color: 'var(--ink-3)' }}>Last bunker</span>
            <span className="font-mono" style={{ color: 'var(--ink)' }}>
              02 May 2026 · Rotterdam
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
