import { Badge, type BadgeColor } from '@fleetops/ui-kit';

interface ProjectJob {
  id: string;
  title: string;
  team: string;
  start: number;
  end: number;
  tone: 'navy' | 'red' | 'amber' | 'green';
}

interface Project {
  id: string;
  name: string;
  period: string;
  start: number;
  end: number;
  leader: string;
  status: 'planning' | 'scheduled' | 'active' | 'completed';
  jobs: ProjectJob[];
}

const PROJECTS: Project[] = [
  {
    id: 'PR-2026Q3',
    name: 'Dry-dock — Sembawang Shipyard',
    period: '14 Jul → 28 Jul 2026',
    start: 0,
    end: 14,
    leader: 'C/E Aalto',
    status: 'planning',
    jobs: [
      {
        id: 'PRJ-0001',
        title: 'Hull cleaning & propeller polishing',
        team: 'Shipyard',
        start: 0,
        end: 4,
        tone: 'navy',
      },
      {
        id: 'PRJ-0002',
        title: 'Main engine cyl unit overhaul (×6)',
        team: 'C/E + crew',
        start: 1,
        end: 8,
        tone: 'red',
      },
      {
        id: 'PRJ-0003',
        title: 'Tail shaft inspection — withdrawal',
        team: 'Shipyard',
        start: 2,
        end: 6,
        tone: 'navy',
      },
      {
        id: 'PRJ-0004',
        title: 'Sea chest grids — descaling + coating',
        team: 'Shipyard',
        start: 3,
        end: 7,
        tone: 'navy',
      },
      {
        id: 'PRJ-0005',
        title: 'Boiler annual survey + retube',
        team: '2/E + class',
        start: 6,
        end: 11,
        tone: 'amber',
      },
      {
        id: 'PRJ-0006',
        title: 'Anchor + chain renewal',
        team: 'Bosun + crew',
        start: 4,
        end: 9,
        tone: 'navy',
      },
      {
        id: 'PRJ-0007',
        title: 'Bunker tank coating renewal — FOT 3P',
        team: 'Shipyard',
        start: 7,
        end: 13,
        tone: 'navy',
      },
      {
        id: 'PRJ-0008',
        title: 'Sea trial & class delivery',
        team: 'Master + DNV',
        start: 13,
        end: 14,
        tone: 'green',
      },
    ],
  },
  {
    id: 'PR-2026R1',
    name: 'Lifeboat refit — port',
    period: '03 Jun → 06 Jun 2026',
    start: 0,
    end: 4,
    leader: 'C/M Karras',
    status: 'scheduled',
    jobs: [
      {
        id: 'PRJ-0011',
        title: 'Lifeboat falls replacement — both sides',
        team: 'Survitec',
        start: 0,
        end: 2,
        tone: 'navy',
      },
      {
        id: 'PRJ-0012',
        title: 'Davit hydraulic system service',
        team: '2/E + crew',
        start: 1,
        end: 3,
        tone: 'navy',
      },
      {
        id: 'PRJ-0013',
        title: 'Load test + class witness',
        team: 'C/M + DNV',
        start: 3,
        end: 4,
        tone: 'green',
      },
    ],
  },
];

const STATUS_COLOR: Record<string, BadgeColor> = {
  planning: 'amber',
  scheduled: 'blue',
  active: 'green',
  completed: 'slate',
};

const TONE_COLOR: Record<string, string> = {
  navy: 'var(--navy)',
  red: 'var(--sig-red)',
  amber: 'var(--sig-amber)',
  green: 'var(--sig-green)',
};

function ProjectCard({ p }: { p: Project }) {
  const dayCount = p.end - p.start;
  const days = Array.from({ length: dayCount }, (_, i) => i);

  return (
    <div
      className="overflow-hidden rounded-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px]" style={{ color: 'var(--ink-3)' }}>
              {p.id}
            </span>
            <Badge color={STATUS_COLOR[p.status] ?? 'slate'}>{p.status.toUpperCase()}</Badge>
          </div>
          <div className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
            {p.name}
          </div>
          <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>
            {p.period} · {dayCount} days · led by {p.leader}
          </div>
        </div>
        <button
          className="px-3 py-1 rounded-2 border text-xs font-medium flex-shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--ink-2)', cursor: 'pointer' }}
        >
          Open
        </button>
      </div>

      {/* Gantt header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div
          className="px-4 py-1.5 text-[10px] uppercase tracking-widest"
          style={{ background: 'var(--surface-sunk)', color: 'var(--ink-3)' }}
        >
          Task / team
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${dayCount}, 1fr)`,
            background: 'var(--surface-sunk)',
          }}
        >
          {days.map((d) => (
            <div
              key={d}
              className="py-1.5 text-center font-mono text-[10px]"
              style={{
                color: 'var(--ink-3)',
                borderLeft: d === 0 ? 'none' : '1px solid var(--hairline)',
              }}
            >
              D{d + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Gantt rows */}
      {p.jobs.map((j) => (
        <div
          key={j.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            alignItems: 'center',
            borderTop: '1px solid var(--hairline)',
            minHeight: 38,
          }}
        >
          <div className="px-4 py-2 min-w-0">
            <div className="text-[12.5px] font-medium truncate" style={{ color: 'var(--ink)' }}>
              {j.title}
            </div>
            <div className="text-[10.5px]" style={{ color: 'var(--ink-3)' }}>
              {j.team}
            </div>
          </div>
          <div style={{ position: 'relative', height: 38, background: 'var(--surface)' }}>
            {/* day gridlines */}
            {days.map((d) => (
              <div
                key={d}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(d / dayCount) * 100}%`,
                  width: 1,
                  background: 'var(--hairline)',
                }}
              />
            ))}
            {/* bar */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                bottom: 8,
                left: `calc(${(j.start / dayCount) * 100}% + 3px)`,
                width: `calc(${((j.end - j.start) / dayCount) * 100}% - 6px)`,
                background: TONE_COLOR[j.tone],
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
              D{j.start + 1} – D{j.end}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MaintenanceProjectsTab() {
  return (
    <div
      className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5"
      style={{ background: 'var(--bg)', minHeight: 0 }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10.5px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ink-3)' }}
        >
          {PROJECTS.length} projects
        </span>
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded-2 text-xs font-medium"
          style={{ background: 'var(--navy)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + New project
        </button>
      </div>
      {PROJECTS.map((p) => (
        <ProjectCard key={p.id} p={p} />
      ))}
    </div>
  );
}
