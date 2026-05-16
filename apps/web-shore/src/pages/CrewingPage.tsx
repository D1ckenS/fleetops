import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, type BadgeColor } from '@fleetops/ui-kit';

// ─── Static data (backend TBD — Phase 2 P2-4) ────────────────────────────────

interface CrewMember {
  id: string;
  rank: string;
  name: string;
  nat: string;
  joined: string;
  off: string;
  wage: string;
  rest: 'green' | 'amber' | 'red';
  cert: 'green' | 'amber' | 'red';
  initials: string;
  dob: string;
  exp: string;
  passport: string;
}

const CREW: CrewMember[] = [
  {
    id: 'C-001',
    rank: 'Master',
    name: 'Lars Eriksson',
    nat: 'SE',
    joined: '11 Mar 2026',
    off: '11 Sep 2026',
    wage: '8200',
    rest: 'green',
    cert: 'green',
    initials: 'LE',
    dob: '14 Apr 1973',
    exp: '28 yr',
    passport: 'SE0481223',
  },
  {
    id: 'C-002',
    rank: 'Chief Officer',
    name: 'Manuel Karras',
    nat: 'GR',
    joined: '04 Feb 2026',
    off: '04 Aug 2026',
    wage: '6800',
    rest: 'green',
    cert: 'green',
    initials: 'MK',
    dob: '02 Nov 1981',
    exp: '15 yr',
    passport: 'GR2204912',
  },
  {
    id: 'C-003',
    rank: '2nd Officer',
    name: 'Carmen Vidal',
    nat: 'ES',
    joined: '18 Feb 2026',
    off: '18 Aug 2026',
    wage: '5400',
    rest: 'amber',
    cert: 'green',
    initials: 'CV',
    dob: '11 Jun 1989',
    exp: '8 yr',
    passport: 'ES8800442',
  },
  {
    id: 'C-004',
    rank: '3rd Officer',
    name: 'Daniel Mokoena',
    nat: 'ZA',
    joined: '20 Apr 2026',
    off: '20 Oct 2026',
    wage: '4600',
    rest: 'green',
    cert: 'amber',
    initials: 'DM',
    dob: '03 Feb 1992',
    exp: '5 yr',
    passport: 'ZA9911082',
  },
  {
    id: 'C-005',
    rank: 'Chief Engineer',
    name: 'Kai Aalto',
    nat: 'FI',
    joined: '01 Apr 2026',
    off: '01 Oct 2026',
    wage: '8400',
    rest: 'green',
    cert: 'green',
    initials: 'KA',
    dob: '17 Sep 1976',
    exp: '22 yr',
    passport: 'FI3018117',
  },
  {
    id: 'C-006',
    rank: '2nd Engineer',
    name: 'Ji-ho Park',
    nat: 'KR',
    joined: '14 Mar 2026',
    off: '14 Sep 2026',
    wage: '6600',
    rest: 'red',
    cert: 'green',
    initials: 'JP',
    dob: '09 Mar 1985',
    exp: '12 yr',
    passport: 'KR4480181',
  },
  {
    id: 'C-007',
    rank: '3rd Engineer',
    name: 'Jamal Reyes',
    nat: 'PH',
    joined: '14 Mar 2026',
    off: '14 Nov 2026',
    wage: '5200',
    rest: 'amber',
    cert: 'green',
    initials: 'JR',
    dob: '22 Jul 1988',
    exp: '9 yr',
    passport: 'PH0892145',
  },
  {
    id: 'C-008',
    rank: '4th Engineer',
    name: 'Tomáš Horák',
    nat: 'CZ',
    joined: '02 May 2026',
    off: '02 Nov 2026',
    wage: '4400',
    rest: 'green',
    cert: 'green',
    initials: 'TH',
    dob: '13 Aug 1994',
    exp: '4 yr',
    passport: 'CZ7711209',
  },
  {
    id: 'C-009',
    rank: 'Electrical Engineer',
    name: 'Priya Iyer',
    nat: 'IN',
    joined: '11 Feb 2026',
    off: '11 Aug 2026',
    wage: '5600',
    rest: 'green',
    cert: 'green',
    initials: 'PI',
    dob: '05 Dec 1986',
    exp: '11 yr',
    passport: 'IN9028441',
  },
  {
    id: 'C-010',
    rank: 'Bosun',
    name: 'Mateo Velasquez',
    nat: 'CO',
    joined: '11 Mar 2026',
    off: '11 Nov 2026',
    wage: '3800',
    rest: 'green',
    cert: 'green',
    initials: 'MV',
    dob: '20 Jan 1979',
    exp: '18 yr',
    passport: 'CO8800117',
  },
  {
    id: 'C-011',
    rank: 'AB',
    name: 'Joel Bautista',
    nat: 'PH',
    joined: '11 Mar 2026',
    off: '11 Dec 2026',
    wage: '2400',
    rest: 'green',
    cert: 'green',
    initials: 'JB',
    dob: '17 May 1983',
    exp: '13 yr',
    passport: 'PH0991238',
  },
  {
    id: 'C-012',
    rank: 'AB',
    name: 'Ade Lin',
    nat: 'ID',
    joined: '11 Mar 2026',
    off: '11 Dec 2026',
    wage: '2400',
    rest: 'green',
    cert: 'green',
    initials: 'AL',
    dob: '04 Mar 1985',
    exp: '11 yr',
    passport: 'ID2204881',
  },
  {
    id: 'C-013',
    rank: 'AB',
    name: 'Boris Mahlangu',
    nat: 'ZA',
    joined: '11 Mar 2026',
    off: '11 Dec 2026',
    wage: '2400',
    rest: 'amber',
    cert: 'amber',
    initials: 'BM',
    dob: '11 Sep 1990',
    exp: '6 yr',
    passport: 'ZA1108239',
  },
  {
    id: 'C-014',
    rank: 'OS',
    name: 'Ravi Singh',
    nat: 'IN',
    joined: '11 Apr 2026',
    off: '11 Jan 2027',
    wage: '1800',
    rest: 'green',
    cert: 'green',
    initials: 'RS',
    dob: '24 Oct 1998',
    exp: '2 yr',
    passport: 'IN1182117',
  },
  {
    id: 'C-015',
    rank: 'OS',
    name: 'Henrik Schmidt',
    nat: 'DE',
    joined: '11 Apr 2026',
    off: '11 Jan 2027',
    wage: '1800',
    rest: 'green',
    cert: 'green',
    initials: 'HS',
    dob: '08 Jul 1999',
    exp: '2 yr',
    passport: 'DE2200831',
  },
  {
    id: 'C-016',
    rank: 'Oiler',
    name: 'José Reyes',
    nat: 'PH',
    joined: '11 Mar 2026',
    off: '11 Dec 2026',
    wage: '2200',
    rest: 'red',
    cert: 'green',
    initials: 'JR',
    dob: '11 Feb 1981',
    exp: '15 yr',
    passport: 'PH7700821',
  },
  {
    id: 'C-017',
    rank: 'Oiler',
    name: 'Kareem Hassan',
    nat: 'EG',
    joined: '11 Mar 2026',
    off: '11 Dec 2026',
    wage: '2200',
    rest: 'green',
    cert: 'green',
    initials: 'KH',
    dob: '15 Jun 1986',
    exp: '10 yr',
    passport: 'EG8821174',
  },
  {
    id: 'C-018',
    rank: 'Wiper',
    name: 'Sergei Volkov',
    nat: 'RU',
    joined: '11 May 2026',
    off: '11 Feb 2027',
    wage: '1700',
    rest: 'green',
    cert: 'green',
    initials: 'SV',
    dob: '22 Mar 2000',
    exp: '1 yr',
    passport: 'RU3308822',
  },
  {
    id: 'C-019',
    rank: 'Cook',
    name: 'Ah Lam Wong',
    nat: 'HK',
    joined: '11 Mar 2026',
    off: '11 Dec 2026',
    wage: '2800',
    rest: 'green',
    cert: 'green',
    initials: 'AW',
    dob: '17 Aug 1975',
    exp: '19 yr',
    passport: 'HK4400112',
  },
  {
    id: 'C-020',
    rank: 'Messman',
    name: 'Diego Salas',
    nat: 'PE',
    joined: '11 Apr 2026',
    off: '11 Jan 2027',
    wage: '1600',
    rest: 'green',
    cert: 'green',
    initials: 'DS',
    dob: '08 May 1996',
    exp: '3 yr',
    passport: 'PE1108229',
  },
  {
    id: 'C-021',
    rank: 'Cadet (Deck)',
    name: 'Sofia Brandt',
    nat: 'NO',
    joined: '11 Apr 2026',
    off: '11 Oct 2026',
    wage: '1200',
    rest: 'green',
    cert: 'green',
    initials: 'SB',
    dob: '03 Feb 2002',
    exp: '<1 yr',
    passport: 'NO4408821',
  },
  {
    id: 'C-022',
    rank: 'Cadet (Engine)',
    name: 'Liam Murray',
    nat: 'IE',
    joined: '11 Apr 2026',
    off: '11 Oct 2026',
    wage: '1200',
    rest: 'green',
    cert: 'green',
    initials: 'LM',
    dob: '11 Jul 2001',
    exp: '<1 yr',
    passport: 'IE7800219',
  },
];

interface CrewCert {
  id: string;
  crewId: string;
  kind: string;
  authority: string;
  expires: string;
  tone: 'green' | 'amber' | 'red';
  daysLeft: number;
}

const CREW_CERTS: CrewCert[] = [
  {
    id: 'CC-2218',
    crewId: 'C-005',
    kind: 'CoC II/2 — Chief Engineer Unlimited',
    authority: 'TraFi (FI)',
    expires: '14 Mar 2028',
    tone: 'green',
    daysLeft: 670,
  },
  {
    id: 'CC-2217',
    crewId: 'C-005',
    kind: 'STCW VI/1 — Basic Safety',
    authority: 'TraFi (FI)',
    expires: '02 Jun 2026',
    tone: 'red',
    daysLeft: 19,
  },
  {
    id: 'CC-2216',
    crewId: 'C-005',
    kind: 'STCW V/3 — High-Voltage',
    authority: 'TraFi (FI)',
    expires: '11 Aug 2027',
    tone: 'green',
    daysLeft: 454,
  },
  {
    id: 'CC-2215',
    crewId: 'C-005',
    kind: 'STCW VI/4 — Medical Care',
    authority: 'TraFi (FI)',
    expires: '22 Jul 2026',
    tone: 'amber',
    daysLeft: 69,
  },
  {
    id: 'CC-2214',
    crewId: 'C-001',
    kind: 'CoC II/2 — Master Unlimited',
    authority: 'Swedish Maritime',
    expires: '11 Sep 2027',
    tone: 'green',
    daysLeft: 485,
  },
  {
    id: 'CC-2213',
    crewId: 'C-001',
    kind: 'STCW V/1 — Tankerman (basic)',
    authority: 'Swedish Maritime',
    expires: '04 Jun 2026',
    tone: 'amber',
    daysLeft: 21,
  },
  {
    id: 'CC-2212',
    crewId: 'C-002',
    kind: 'CoC II/1 — Chief Officer',
    authority: 'Hellenic Min.',
    expires: '14 Sep 2026',
    tone: 'amber',
    daysLeft: 123,
  },
  {
    id: 'CC-2211',
    crewId: 'C-004',
    kind: 'CoC II/1 — OOW',
    authority: 'SAMSA (ZA)',
    expires: '02 Jun 2026',
    tone: 'red',
    daysLeft: 19,
  },
  {
    id: 'CC-2210',
    crewId: 'C-013',
    kind: 'STCW II/4 — AB',
    authority: 'SAMSA (ZA)',
    expires: '11 Jul 2026',
    tone: 'amber',
    daysLeft: 58,
  },
  {
    id: 'CC-2209',
    crewId: 'C-006',
    kind: 'CoC III/1 — Watchkeeping Engineer',
    authority: 'Korea Coast Guard',
    expires: '04 Dec 2027',
    tone: 'green',
    daysLeft: 569,
  },
];

interface Drill {
  id: string;
  date: string;
  type: string;
  location: string;
  attendance: string;
  tone: BadgeColor;
  duration: string;
  findings: number;
}

const DRILLS: Drill[] = [
  {
    id: 'DR-0142',
    date: '08 May 2026 14:00',
    type: 'Fire — Engine room',
    location: 'ER2 / Muster A',
    attendance: '18/22',
    tone: 'green',
    duration: '42 min',
    findings: 0,
  },
  {
    id: 'DR-0141',
    date: '01 May 2026 14:00',
    type: 'Abandon ship',
    location: 'Boat deck / Stn 1+2',
    attendance: '21/22',
    tone: 'green',
    duration: '58 min',
    findings: 1,
  },
  {
    id: 'DR-0140',
    date: '24 Apr 2026 14:00',
    type: 'Enclosed space rescue',
    location: 'Cargo hold 3',
    attendance: '14/22',
    tone: 'amber',
    duration: '46 min',
    findings: 2,
  },
  {
    id: 'DR-0139',
    date: '17 Apr 2026 14:00',
    type: 'Oil pollution response',
    location: 'Main deck',
    attendance: '16/22',
    tone: 'green',
    duration: '35 min',
    findings: 0,
  },
  {
    id: 'DR-0138',
    date: '10 Apr 2026 14:00',
    type: 'Man overboard',
    location: 'Bridge wing',
    attendance: '12/22',
    tone: 'amber',
    duration: '28 min',
    findings: 1,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const deptOf = (rank: string): 'Deck' | 'Engine' | 'Galley' => {
  if (
    rank.includes('Engineer') ||
    rank === 'Oiler' ||
    rank === 'Wiper' ||
    rank === 'Cadet (Engine)'
  )
    return 'Engine';
  if (
    rank.includes('Officer') ||
    rank === 'Master' ||
    rank === 'Bosun' ||
    ['AB', 'OS', 'Cadet (Deck)'].includes(rank)
  )
    return 'Deck';
  return 'Galley';
};

const DEPT_COLOR: Record<string, BadgeColor> = { Deck: 'blue', Engine: 'amber', Galley: 'purple' };
const deptColor = (dept: string): BadgeColor => DEPT_COLOR[dept] ?? 'slate';

const REST_COLOR: Record<string, BadgeColor> = { green: 'green', amber: 'amber', red: 'red' };
const restColor = (rest: string): BadgeColor => REST_COLOR[rest] ?? 'slate';

// Pseudo-random rest grid generator (ported from design)
function buildRestGrid(seed: number): number[][] {
  const days = 14;
  const grid: number[][] = [];
  let s = seed * 1000 + 7;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let d = 0; d < days; d++) {
    const row = new Array(24).fill(0) as number[];
    const w1 = Math.floor(rnd() * 24);
    const w2 = (w1 + 12 + Math.floor(rnd() * 2 - 1)) % 24;
    for (let h = 0; h < 4; h++) {
      row[(w1 + h) % 24] = 1;
      row[(w2 + h) % 24] = 1;
    }
    if (rnd() > 0.6) {
      const o = Math.floor(rnd() * 24);
      for (let h = 0; h < 1 + Math.floor(rnd() * 3); h++) row[(o + h) % 24] = 1;
    }
    if (rnd() > 0.85) {
      const o = Math.floor(rnd() * 24);
      for (let h = 0; h < 4; h++) row[(o + h) % 24] = 1;
    }
    grid.push(row);
  }
  return grid;
}

function mlcMetrics(grid: number[][]) {
  const dayRest = grid.map((row) => 24 - row.reduce((a, b) => a + b, 0));
  const breach24 = dayRest.map((r) => r < 10);
  const week: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    let s = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) s += dayRest[j] ?? 0;
    week.push(s);
  }
  return { dayRest, breach24, week, breach7: week.map((r) => r < 77) };
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function CrewAvatar({
  initials,
  size = 28,
  tone,
}: {
  initials: string;
  size?: number;
  tone: string;
}) {
  const bg =
    tone === 'red' ? 'var(--sig-red)' : tone === 'amber' ? 'var(--sig-amber)' : 'var(--navy-2)';
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: bg,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

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
      className="h-[22px] px-2 rounded-1 text-[11px] font-medium transition-colors whitespace-nowrap"
    >
      {children}
    </button>
  );
}

// ─── Crew tab ─────────────────────────────────────────────────────────────────

function CrewDetailPane({ c, onClose }: { c: CrewMember; onClose: () => void }) {
  const dept = deptOf(c.rank);
  const certs = CREW_CERTS.filter((cc) => cc.crewId === c.id);
  const monoFields = ['Wage', 'Passport', 'Joined', 'Sign-off', 'Date of birth'];
  const rows: [string, string][] = [
    ['Nationality', c.nat],
    ['Date of birth', c.dob],
    ['Experience', c.exp],
    ['Passport', c.passport],
    ['Joined', c.joined],
    ['Sign-off', c.off],
    ['Wage', `USD ${c.wage} / mo`],
  ];

  return (
    <aside
      style={{
        width: 340,
        flexShrink: 0,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex items-center gap-3">
            <CrewAvatar initials={c.initials} size={48} tone={c.rest} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                  {c.id}
                </span>
                <Badge color={deptColor(dept)}>{dept.toUpperCase()}</Badge>
              </div>
              <div
                className="text-[15px] font-semibold"
                style={{ color: 'var(--ink)', letterSpacing: '-0.005em' }}
              >
                {c.name}
              </div>
              <div className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
                {c.rank}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-sm rounded-1"
              style={{
                color: 'var(--ink-3)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Contract info */}
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', fontSize: 12 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}>
              <div
                className="px-4 py-1.5"
                style={{ color: 'var(--ink-3)', borderTop: '1px solid var(--hairline)' }}
              >
                {k}
              </div>
              <div
                className="px-4 py-1.5"
                style={{
                  color: 'var(--ink)',
                  borderTop: '1px solid var(--hairline)',
                  fontFamily: monoFields.includes(k) ? 'var(--font-mono)' : 'var(--font-ui)',
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* MLC rest */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--hairline)' }}>
          <div
            className="text-[10.5px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--ink-3)' }}
          >
            MLC 2006 — 7-day rest
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[22px] font-semibold" style={{ color: 'var(--ink)' }}>
              {c.rest === 'green' ? '84.5' : c.rest === 'amber' ? '78.2' : '71.4'} h
            </span>
            <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
              of ≥77 h required
            </span>
            <div className="flex-1" />
            <Badge color={restColor(c.rest)}>
              {c.rest === 'red' ? '2 BREACHES' : c.rest === 'amber' ? 'EDGE' : 'COMPLIANT'}
            </Badge>
          </div>
        </div>

        {/* Certs */}
        <div className="px-4 pt-2 pb-1" style={{ borderTop: '1px solid var(--hairline)' }}>
          <div
            className="text-[10.5px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ink-3)' }}
          >
            Certificates ({certs.length})
          </div>
        </div>
        {certs.length === 0 ? (
          <div className="px-4 pb-4 text-xs" style={{ color: 'var(--ink-3)' }}>
            No certs filed yet.
          </div>
        ) : (
          certs.map((cc) => (
            <div
              key={cc.id}
              className="px-4 py-2"
              style={{
                borderTop: '1px solid var(--hairline)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 4,
              }}
            >
              <div>
                <div className="text-[12px] font-medium" style={{ color: 'var(--ink)' }}>
                  {cc.kind}
                </div>
                <div className="text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                  {cc.authority}
                </div>
              </div>
              <div className="text-right">
                <Badge color={cc.tone}>{cc.daysLeft < 30 ? `${cc.daysLeft} d` : 'OK'}</Badge>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--ink-3)' }}>
                  {cc.expires}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="flex gap-2 p-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}
      >
        <button
          className="flex-1 py-1.5 rounded-2 text-xs font-medium border"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--ink-2)',
            background: 'var(--surface)',
            cursor: 'pointer',
          }}
        >
          Roster
        </button>
        <button
          className="flex-1 py-1.5 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Open profile
        </button>
      </div>
    </aside>
  );
}

function CrewTab() {
  const [selected, setSelected] = useState<string | null>('C-005');
  const [dept, setDept] = useState('All');

  const visible = dept === 'All' ? CREW : CREW.filter((c) => deptOf(c.rank) === dept);
  const sel = CREW.find((c) => c.id === selected) ?? null;

  return (
    <div className="flex flex-1 min-h-0">
      <section className="flex flex-col flex-1 min-w-0">
        {/* Dept filter */}
        <div
          className="flex items-center gap-2 px-4 py-2 flex-shrink-0 flex-wrap"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)' }}
        >
          <span
            className="text-[10.5px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ink-3)' }}
          >
            Department
          </span>
          <div className="flex gap-1.5">
            {['All', 'Deck', 'Engine', 'Galley'].map((d) => (
              <Chip key={d} active={dept === d} onClick={() => setDept(d)}>
                {d}
              </Chip>
            ))}
          </div>
          <div className="flex-1" />
          <span className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
            {visible.length} of {CREW.length} on board
          </span>
        </div>

        {/* Column headers */}
        <div
          className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
          style={{
            gridTemplateColumns: '36px 70px 1fr 110px 44px 110px 90px 72px',
            background: 'var(--surface-sunk)',
            color: 'var(--ink-3)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span />
          <span>ID</span>
          <span>Crew / rank</span>
          <span>Dept</span>
          <span>Nat</span>
          <span>Sign-off</span>
          <span>MLC rest</span>
          <span>Certs</span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
          {visible.map((c) => (
            <div
              key={c.id}
              className="grid gap-2 px-4 py-2.5 items-center cursor-pointer transition-colors"
              style={{
                gridTemplateColumns: '36px 70px 1fr 110px 44px 110px 90px 72px',
                borderTop: '1px solid var(--hairline)',
                background: selected === c.id ? 'var(--surface-sunk)' : 'var(--surface)',
              }}
              onMouseEnter={(e) => {
                if (selected !== c.id)
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  selected === c.id ? 'var(--surface-sunk)' : 'var(--surface)';
              }}
              onClick={() => setSelected(selected === c.id ? null : c.id)}
            >
              <CrewAvatar initials={c.initials} size={28} tone={c.rest} />
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
                {c.id}
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--ink)' }}>
                  {c.name}
                </div>
                <div className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
                  {c.rank}
                </div>
              </div>
              <Badge color={deptColor(deptOf(c.rank))}>{deptOf(c.rank).toUpperCase()}</Badge>
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                {c.nat}
              </span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
                {c.off}
              </span>
              <Badge color={restColor(c.rest)}>
                {c.rest === 'green' ? 'COMPLIANT' : c.rest === 'amber' ? 'EDGE' : 'BREACH'}
              </Badge>
              <Badge color={c.cert === 'green' ? 'green' : c.cert === 'amber' ? 'amber' : 'red'}>
                {c.cert === 'green' ? 'OK' : c.cert === 'amber' ? '≤90 d' : '≤7 d'}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      {sel ? (
        <CrewDetailPane c={sel} onClose={() => setSelected(null)} />
      ) : (
        <aside
          style={{
            width: 340,
            flexShrink: 0,
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--ink-3)' }}>
            Select a crew member to view contract, MLC compliance, and certificates.
          </p>
        </aside>
      )}
    </div>
  );
}

// ─── Rotation tab ─────────────────────────────────────────────────────────────

const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const TOTAL_WEEKS = 32;
const TODAY_WEEK = 10;

function parseWeek(dateStr: string): number {
  const monthIdx: Record<string, number> = {
    Jan: -2,
    Feb: -1,
    Mar: 0,
    Apr: 1,
    May: 2,
    Jun: 3,
    Jul: 4,
    Aug: 5,
    Sep: 6,
    Oct: 7,
    Nov: 8,
    Dec: 9,
  };
  const parts = dateStr.split(' ');
  const day = parseInt(parts[0] ?? '1', 10);
  const mo = parts[1] ?? 'Mar';
  return (monthIdx[mo] ?? 0) * 4 + Math.floor((day - 1) / 7);
}

function RotationTab() {
  const rotations = CREW.map((c) => ({
    ...c,
    start: Math.max(0, parseWeek(c.joined)),
    end: Math.min(TOTAL_WEEKS, parseWeek(c.off)),
  }));

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ background: 'var(--bg)' }}>
      <div
        className="overflow-hidden rounded-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-wrap"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          <span
            className="text-[10.5px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ink-3)' }}
          >
            Crew rotations · Mar–Oct 2026
          </span>
          <div className="flex-1" />
          <Badge color="green">↓ 2 SIGN-ON · 2 wk</Badge>
          <Badge color="amber">↑ 4 SIGN-OFF · 4 wk</Badge>
          <button
            className="px-3 py-1 rounded-2 border text-[11px] font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--ink-2)', cursor: 'pointer' }}
          >
            Plan roster
          </button>
        </div>

        {/* Month header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            background: 'var(--surface-sunk)',
          }}
        >
          <div
            className="px-4 py-1.5 text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--ink-3)' }}
          >
            Crew
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MONTHS.length}, 1fr)` }}>
            {MONTHS.map((m, i) => (
              <div
                key={m}
                className="py-1.5 text-center font-mono text-[10.5px]"
                style={{
                  color: 'var(--ink-3)',
                  borderLeft: i === 0 ? 'none' : '1px solid var(--hairline)',
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {rotations.map((c) => {
          const dept = deptOf(c.rank);
          const barColor =
            dept === 'Deck'
              ? 'var(--sig-blue)'
              : dept === 'Engine'
                ? 'var(--sig-amber)'
                : 'var(--sig-purple)';
          const leftPct = (c.start / TOTAL_WEEKS) * 100;
          const widthPct = ((c.end - c.start) / TOTAL_WEEKS) * 100;
          return (
            <div
              key={c.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                borderTop: '1px solid var(--hairline)',
                alignItems: 'center',
                minHeight: 36,
              }}
            >
              <div className="px-4 flex items-center gap-2">
                <CrewAvatar initials={c.initials} size={22} tone={c.rest} />
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[12px] font-semibold truncate"
                    style={{ color: 'var(--ink)' }}
                  >
                    {c.name}
                  </div>
                  <div className="text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                    {c.rank}
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', height: 36, background: 'var(--surface)' }}>
                {/* Month grid lines */}
                {MONTHS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${(i / MONTHS.length) * 100}%`,
                      width: 1,
                      background: 'var(--hairline)',
                    }}
                  />
                ))}
                {/* Today line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${(TODAY_WEEK / TOTAL_WEEKS) * 100}%`,
                    width: 1,
                    background: 'var(--ink)',
                    zIndex: 2,
                  }}
                />
                {/* Contract bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 7,
                    bottom: 7,
                    left: `calc(${leftPct}% + 2px)`,
                    width: `calc(${widthPct}% - 4px)`,
                    background: barColor,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    color: '#fff',
                    fontSize: 10.5,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {c.joined.split(' ').slice(0, 2).join(' ')} →{' '}
                  {c.off.split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Rest Hours tab ───────────────────────────────────────────────────────────

function RestHoursTab() {
  const [crewId, setCrewId] = useState('C-006');
  const sel = CREW.find((c) => c.id === crewId)!;

  const sortedCrew = [...CREW].sort((a, b) => {
    const t: Record<string, number> = { red: 0, amber: 1, green: 2 };
    return (t[a.rest] ?? 2) - (t[b.rest] ?? 2);
  });

  const seedFor = (c: CrewMember) =>
    CREW.findIndex((x) => x.id === c.id) + (c.rest === 'red' ? 5 : c.rest === 'amber' ? 12 : 1);
  const grid = useMemo(() => buildRestGrid(seedFor(sel)), [crewId]);
  const metrics = useMemo(() => mlcMetrics(grid), [grid]);

  const restAvg = (metrics.dayRest.reduce((a, b) => a + b, 0) / metrics.dayRest.length).toFixed(1);
  const breaches24 = metrics.breach24.filter(Boolean).length;
  const breaches7 = metrics.breach7.filter(Boolean).length;

  return (
    <div className="flex flex-1 min-h-0">
      {/* Left rail */}
      <aside
        className="flex flex-col flex-shrink-0"
        style={{ width: 260, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <div
          className="px-4 py-2 text-[10.5px] font-semibold uppercase tracking-widest flex-shrink-0"
          style={{ borderBottom: '1px solid var(--hairline)', color: 'var(--ink-3)' }}
        >
          Crew · sorted by risk
        </div>
        <div className="flex-1 overflow-y-auto p-1.5">
          {sortedCrew.map((c) => {
            const isActive = c.id === crewId;
            const dot =
              c.rest === 'red'
                ? 'var(--sig-red)'
                : c.rest === 'amber'
                  ? 'var(--sig-amber)'
                  : 'var(--sig-green)';
            return (
              <button
                key={c.id}
                onClick={() => setCrewId(c.id)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-2 text-left h-9"
                style={{
                  background: isActive ? 'var(--surface-2)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <CrewAvatar initials={c.initials} size={24} tone={c.rest} />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[12px] truncate"
                    style={{ fontWeight: isActive ? 600 : 500, color: 'var(--ink)' }}
                  >
                    {c.name}
                  </div>
                  <div className="text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                    {c.rank}
                  </div>
                </div>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: dot,
                    flexShrink: 0,
                  }}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Detail */}
      <section className="flex-1 overflow-y-auto min-w-0" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <CrewAvatar initials={sel.initials} size={42} tone={sel.rest} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2
                className="text-[17px] font-semibold m-0"
                style={{ color: 'var(--ink)', letterSpacing: '-0.005em' }}
              >
                {sel.name}
              </h2>
              <span className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
                · {sel.rank}
              </span>
            </div>
            <div className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
              14-day work / rest log · MLC 2006
            </div>
          </div>
          <button
            className="px-3 py-1 rounded-2 border text-xs font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--ink-2)', cursor: 'pointer' }}
          >
            Export PDF
          </button>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-4 gap-2.5 p-4">
          {[
            {
              label: 'Rest — daily avg',
              value: `${restAvg} h`,
              sub: 'of ≥10 h required',
              bad: parseFloat(restAvg) < 10,
            },
            {
              label: 'Breaches — 24 h rule',
              value: String(breaches24),
              sub: 'days < 10 h rest',
              bad: breaches24 > 0,
            },
            {
              label: 'Breaches — 7-day rule',
              value: String(breaches7),
              sub: 'rolling weeks < 77 h',
              bad: breaches7 > 0,
            },
            {
              label: 'Compliance',
              value: `${Math.round(((14 - breaches24) / 14) * 100)}%`,
              sub: 'last 14 days',
              bad: sel.rest === 'red',
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-3 rounded-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-[10.5px] mb-1" style={{ color: 'var(--ink-3)' }}>
                {kpi.label}
              </div>
              <div
                className="font-mono text-[22px] font-semibold"
                style={{ color: kpi.bad ? 'var(--sig-red)' : 'var(--ink)' }}
              >
                {kpi.value}
              </div>
              <div className="text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Work/rest grid */}
        <div className="px-4 pb-4">
          <div
            className="rounded-3 overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="flex items-center px-4 py-2.5"
              style={{ borderBottom: '1px solid var(--hairline)' }}
            >
              <span
                className="text-[10.5px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--ink-3)' }}
              >
                Work / rest log · hourly · 14 days
              </span>
              <div className="flex-1" />
              <div
                className="flex items-center gap-3 text-[10.5px]"
                style={{ color: 'var(--ink-3)' }}
              >
                <span className="flex items-center gap-1">
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      background: 'var(--navy)',
                      borderRadius: 1,
                      display: 'inline-block',
                    }}
                  />{' '}
                  work
                </span>
                <span className="flex items-center gap-1">
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      background: 'var(--surface-sunk)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 1,
                      display: 'inline-block',
                    }}
                  />{' '}
                  rest
                </span>
                <span className="flex items-center gap-1">
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      background: 'var(--sig-red-bg)',
                      border: '1px solid var(--sig-red)',
                      borderRadius: 1,
                      display: 'inline-block',
                    }}
                  />{' '}
                  breach
                </span>
              </div>
            </div>

            <div className="overflow-auto px-4 py-3">
              {/* Hour header */}
              <div
                className="font-mono text-[9px] mb-1.5"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px repeat(24, 1fr) 60px 72px',
                  gap: 1,
                  color: 'var(--ink-3)',
                  minWidth: 760,
                }}
              >
                <span />
                {Array.from({ length: 24 }, (_, h) => (
                  <span
                    key={h}
                    style={{ textAlign: 'center', visibility: h % 3 === 0 ? 'visible' : 'hidden' }}
                  >
                    {String(h).padStart(2, '0')}
                  </span>
                ))}
                <span style={{ textAlign: 'right' }}>24 h</span>
                <span style={{ textAlign: 'right' }}>7-day</span>
              </div>

              {/* Day rows */}
              {grid.map((row, d) => {
                const label = d < 3 ? `${28 + d} Apr` : `${d - 2} May`;
                const breach24 = metrics.breach24[d];
                const breach7 = metrics.breach7[d];
                return (
                  <div
                    key={d}
                    className="mb-0.5"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px repeat(24, 1fr) 60px 72px',
                      gap: 1,
                      minWidth: 760,
                      alignItems: 'center',
                    }}
                  >
                    <span
                      className="font-mono text-[10px]"
                      style={{
                        color: breach24 ? 'var(--sig-red)' : 'var(--ink-3)',
                        fontWeight: breach24 ? 600 : 400,
                      }}
                    >
                      {label}
                    </span>
                    {row.map((cell, h) => (
                      <div
                        key={h}
                        style={{
                          height: 14,
                          background: cell ? 'var(--navy)' : 'var(--surface-sunk)',
                          border: breach24
                            ? '1px solid rgba(171,56,46,0.35)'
                            : `1px solid ${cell ? 'var(--navy)' : 'var(--hairline)'}`,
                          borderRadius: 1,
                        }}
                      />
                    ))}
                    <span
                      className="font-mono text-[10.5px] text-right"
                      style={{
                        color: breach24 ? 'var(--sig-red)' : 'var(--ink-2)',
                        fontWeight: breach24 ? 600 : 500,
                      }}
                    >
                      {metrics.dayRest[d]}h{breach24 ? ' !' : ''}
                    </span>
                    <span
                      className="font-mono text-[10.5px] text-right"
                      style={{
                        color: breach7 ? 'var(--sig-red)' : 'var(--ink-2)',
                        fontWeight: breach7 ? 600 : 500,
                      }}
                    >
                      {metrics.week[d]}h{breach7 ? ' !' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className="flex items-center justify-between px-4 py-2.5 text-[11px]"
              style={{
                borderTop: '1px solid var(--hairline)',
                background: 'var(--surface-2)',
                color: 'var(--ink-3)',
              }}
            >
              <span>
                MLC 2006: rest must be ≥ 10 h in any 24 h window and ≥ 77 h in any 7-day rolling
                window.
              </span>
              <span className="font-mono">Source: noon report · last sync 14:32 UTC</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Certificates tab ─────────────────────────────────────────────────────────

function CertificatesTab() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'soon'>('all');

  const visible =
    filter === 'critical'
      ? CREW_CERTS.filter((c) => c.tone === 'red')
      : filter === 'soon'
        ? CREW_CERTS.filter((c) => c.tone !== 'green')
        : CREW_CERTS;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-4 py-2 flex-shrink-0 flex-wrap"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)' }}
      >
        <span
          className="text-[10.5px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          Filter
        </span>
        <div className="flex gap-1.5">
          {[
            { id: 'all' as const, label: `All · ${CREW_CERTS.length}` },
            { id: 'critical' as const, label: 'Expiring ≤ 7 d' },
            { id: 'soon' as const, label: 'Expiring ≤ 90 d' },
          ].map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded-2 border text-xs font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--ink-2)', cursor: 'pointer' }}
        >
          Notification thresholds
        </button>
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + Upload cert
        </button>
      </div>

      {/* Column headers */}
      <div
        className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
        style={{
          gridTemplateColumns: '90px 170px 1fr 160px 110px 90px 80px',
          background: 'var(--surface-sunk)',
          color: 'var(--ink-3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span>Cert</span>
        <span>Crew</span>
        <span>Type</span>
        <span>Issuing authority</span>
        <span>Expires</span>
        <span>Days left</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
        {visible.map((cc) => {
          const crew = CREW.find((c) => c.id === cc.crewId);
          return (
            <div
              key={cc.id}
              className="grid gap-2 px-4 py-2.5 items-center"
              style={{
                gridTemplateColumns: '90px 170px 1fr 160px 110px 90px 80px',
                borderTop: '1px solid var(--hairline)',
              }}
            >
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
                {cc.id}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                {crew && <CrewAvatar initials={crew.initials} size={22} tone={crew.rest} />}
                <div className="min-w-0">
                  <div className="text-[12px] font-medium truncate" style={{ color: 'var(--ink)' }}>
                    {crew?.name}
                  </div>
                  <div className="text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
                    {crew?.rank}
                  </div>
                </div>
              </div>
              <span className="text-[12.5px] truncate" style={{ color: 'var(--ink)' }}>
                {cc.kind}
              </span>
              <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
                {cc.authority}
              </span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
                {cc.expires}
              </span>
              <Badge color={cc.tone}>{cc.daysLeft} d</Badge>
              <button
                className="px-3 py-1 rounded-2 border text-[11px] font-medium justify-self-end"
                style={{
                  borderColor: 'var(--border)',
                  color: cc.tone === 'red' ? 'var(--sig-red)' : 'var(--ink-2)',
                  cursor: 'pointer',
                }}
              >
                {cc.tone === 'red' ? 'Renew' : 'Open'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Drills tab ───────────────────────────────────────────────────────────────

function DrillsTab() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-2 flex-shrink-0 flex-wrap"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)' }}
      >
        <span
          className="text-[10.5px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          Drill register · last 90 d
        </span>
        <span className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
          5 drills · 18.4 avg attendance · 4 findings → 3 closed via CAPA
        </span>
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded-2 border text-xs font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--ink-2)', cursor: 'pointer' }}
        >
          Filter type
        </button>
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + Schedule drill
        </button>
      </div>

      {/* Column headers */}
      <div
        className="grid gap-2 px-4 py-2 flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-widest"
        style={{
          gridTemplateColumns: '90px 140px 1fr 150px 90px 110px 90px 70px',
          background: 'var(--surface-sunk)',
          color: 'var(--ink-3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span>Drill</span>
        <span>Date</span>
        <span>Type</span>
        <span>Location</span>
        <span className="text-right">Duration</span>
        <span>Attendance</span>
        <span className="text-right">Findings</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
        {DRILLS.map((d) => (
          <div
            key={d.id}
            className="grid gap-2 px-4 py-2.5 items-center"
            style={{
              gridTemplateColumns: '90px 140px 1fr 150px 90px 110px 90px 70px',
              borderTop: '1px solid var(--hairline)',
            }}
          >
            <span className="font-mono text-[11px]" style={{ color: 'var(--ink-2)' }}>
              {d.id}
            </span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
              {d.date}
            </span>
            <span className="text-[12.5px] font-medium" style={{ color: 'var(--ink)' }}>
              {d.type}
            </span>
            <span className="text-[11.5px]" style={{ color: 'var(--ink-2)' }}>
              {d.location}
            </span>
            <span className="font-mono text-[11px] text-right" style={{ color: 'var(--ink-3)' }}>
              {d.duration}
            </span>
            <Badge color={d.tone}>{d.attendance}</Badge>
            <span
              className="font-mono text-[11.5px] text-right"
              style={{
                color: d.findings > 0 ? 'var(--sig-amber)' : 'var(--ink-3)',
                fontWeight: d.findings > 0 ? 600 : 400,
              }}
            >
              {d.findings}
            </span>
            <button
              className="px-2.5 py-1 rounded-2 border text-[11px] font-medium justify-self-end"
              style={{ borderColor: 'var(--border)', color: 'var(--ink-2)', cursor: 'pointer' }}
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'crew' | 'rotation' | 'rest-hours' | 'certificates' | 'drills';

const TABS: { id: Tab; label: string; count: number }[] = [
  { id: 'crew', label: 'Crew', count: CREW.length },
  { id: 'rotation', label: 'Rotation', count: CREW.length },
  { id: 'rest-hours', label: 'Rest hours', count: CREW.filter((c) => c.rest !== 'green').length },
  { id: 'certificates', label: 'Certificates', count: CREW_CERTS.length },
  { id: 'drills', label: 'Drills', count: DRILLS.length },
];

export function CrewingPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'crew';
  const [search, setSearch] = useState('');

  const setTab = (t: Tab) => setParams(t === 'crew' ? {} : { tab: t });

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
          Crewing
        </h1>
        <span className="text-[12px] whitespace-nowrap" style={{ color: 'var(--ink-3)' }}>
          MV HALCYON · {CREW.length} on board · MLC 2006
        </span>
        <div className="flex-1" />
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 h-7 rounded-2 text-[12px]"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--ink-3)',
            width: 200,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.5 10.5 L14 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crew, certs…"
            className="flex-1 bg-transparent outline-none text-[12px]"
            style={{ color: 'var(--ink)', border: 'none' }}
          />
        </div>
        <button
          className="px-3 py-1 rounded-2 border text-xs font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--ink-2)', cursor: 'pointer' }}
        >
          Crew pool
        </button>
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + Sign on
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
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {tab === 'crew' && <CrewTab />}
        {tab === 'rotation' && <RotationTab />}
        {tab === 'rest-hours' && <RestHoursTab />}
        {tab === 'certificates' && <CertificatesTab />}
        {tab === 'drills' && <DrillsTab />}
      </div>
    </div>
  );
}
