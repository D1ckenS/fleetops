import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { useVessel } from '../context/VesselContext.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface FleetSummary {
  fleet: {
    totalVessels: number;
    overdueJobs: number;
    expiringCerts: number;
    pendingApprovals: number;
    openFindings: number;
  };
  vessels: VesselRow[];
}

interface VesselRow {
  id: string;
  name: string;
  imoNumber: string | null;
  status: {
    overdueJobs: number;
    dueThisWeek: number;
    expiringCerts: number;
    pendingApprovals: number;
    openFindings: number;
  };
}

interface WorklistItem {
  type: string;
  vesselId: string;
  vesselName: string;
  entityId: string;
  description: string;
  dueAt: string | null;
  severity: 'red' | 'amber' | 'blue' | 'neutral';
}

interface BudgetActuals {
  year: number;
  budgets: {
    id: string;
    name: string;
    vesselId: string | null;
    totalBudgeted: number;
    totalActual: number;
    currency: string;
    lines: { category: string; budgetedAmount: number; currency: string }[];
  }[];
}

// ── Sub-components ───────────────────────────────────────────────────────────

const SIG = {
  red: { bg: '#F2DDD8', fg: '#AB382E' },
  amber: { bg: '#F4E7D0', fg: '#B5731E' },
  green: { bg: '#E2EEE6', fg: '#2F7D4F' },
  blue: { bg: '#DFE8F4', fg: '#1F5B9D' },
  neutral: { bg: '#F4F2EC', fg: '#41546A' },
} as const;

function KpiTile({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: number;
  tone: keyof typeof SIG;
  sub?: string;
}) {
  const { bg, fg } = SIG[tone];
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E5E3DA',
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#8893A0',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '-0.025em',
          fontFamily: '"Geist Mono", monospace',
          color: '#0A1F33',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            background: bg,
            color: fg,
            fontSize: 10.5,
            fontWeight: 500,
            padding: '1px 6px',
            borderRadius: 4,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function StatusPill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: keyof typeof SIG;
}) {
  if (count === 0) return null;
  const { bg, fg } = SIG[tone];
  return (
    <span
      title={label}
      style={{
        background: bg,
        color: fg,
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 99,
        whiteSpace: 'nowrap',
      }}
    >
      {count} {label}
    </span>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuth();
  const { setSelectedVesselId } = useVessel();
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetActuals | null>(null);
  const [loading, setLoading] = useState(true);

  const year = new Date().getFullYear();

  useEffect(() => {
    Promise.all([
      api.get<FleetSummary>('/fleetview/summary').catch(() => null),
      api
        .get<{ items: WorklistItem[] }>('/fleetview/worklist?limit=20')
        .catch(() => ({ items: [] })),
      api.get<BudgetActuals>(`/fleetview/budget-actuals?year=${year}`).catch(() => null),
    ])
      .then(([s, w, b]) => {
        setSummary(s);
        setWorklist(w?.items ?? []);
        setBudgetData(b);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fleet = summary?.fleet;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.011em',
            color: '#0A1F33',
            margin: '0 0 3px',
          }}
        >
          {greeting()}
          {user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p style={{ fontSize: 13, color: '#8893A0', margin: 0 }}>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {loading ? (
        <div
          style={{
            height: 120,
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #E5E3DA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8893A0',
            marginBottom: 24,
          }}
        >
          Loading fleet data…
        </div>
      ) : (
        <>
          {/* Fleet KPI strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <KpiTile
              label="Vessels"
              value={fleet?.totalVessels ?? 0}
              tone="neutral"
              sub="in fleet"
            />
            <KpiTile
              label="Overdue jobs"
              value={fleet?.overdueJobs ?? 0}
              tone={(fleet?.overdueJobs ?? 0) > 0 ? 'red' : 'green'}
              sub={(fleet?.overdueJobs ?? 0) > 0 ? 'Needs attention' : 'All clear'}
            />
            <KpiTile
              label="Expiring certs"
              value={fleet?.expiringCerts ?? 0}
              tone={(fleet?.expiringCerts ?? 0) > 0 ? 'amber' : 'green'}
              sub="within 30 days"
            />
            <KpiTile
              label="Pending approvals"
              value={fleet?.pendingApprovals ?? 0}
              tone={(fleet?.pendingApprovals ?? 0) > 0 ? 'amber' : 'green'}
              sub={(fleet?.pendingApprovals ?? 0) > 0 ? 'Review' : 'All clear'}
            />
            <KpiTile
              label="Open findings"
              value={fleet?.openFindings ?? 0}
              tone={(fleet?.openFindings ?? 0) > 0 ? 'amber' : 'green'}
              sub={(fleet?.openFindings ?? 0) > 0 ? 'Review' : 'All clear'}
            />
          </div>

          {/* Main content grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
            {/* Left: vessel fleet table */}
            <div>
              {/* Fleet table */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #E5E3DA',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    padding: '11px 16px',
                    borderBottom: '1px solid #EEEBE2',
                    background: '#F4F2EC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0A1F33', flex: 1 }}>
                    Fleet
                  </span>
                  <span style={{ fontSize: 11, color: '#8893A0' }}>
                    {summary?.vessels.length ?? 0} vessel
                    {(summary?.vessels.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Column headers */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    padding: '7px 16px',
                    borderBottom: '1px solid #EEEBE2',
                    background: '#FAFAF7',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      color: '#8893A0',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Vessel
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      color: '#8893A0',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Status
                  </span>
                </div>

                {summary?.vessels.length === 0 && (
                  <div
                    style={{
                      padding: '28px 16px',
                      textAlign: 'center',
                      color: '#8893A0',
                      fontSize: 12,
                    }}
                  >
                    No vessels yet. Add vessels via the Vessels &amp; Users page.
                  </div>
                )}

                {summary?.vessels.map((v) => {
                  const allClear =
                    v.status.overdueJobs === 0 &&
                    v.status.expiringCerts === 0 &&
                    v.status.pendingApprovals === 0 &&
                    v.status.openFindings === 0;

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVesselId(v.id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderTop: '1px solid #EEEBE2',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                        gap: 12,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = '#FAFAF7';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#0A1F33',
                            marginBottom: 2,
                          }}
                        >
                          {v.name}
                        </div>
                        {v.imoNumber && (
                          <div style={{ fontSize: 11, color: '#8893A0' }}>IMO {v.imoNumber}</div>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 5,
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {allClear ? (
                          <span
                            style={{
                              background: SIG.green.bg,
                              color: SIG.green.fg,
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: 99,
                            }}
                          >
                            All clear
                          </span>
                        ) : (
                          <>
                            <StatusPill count={v.status.overdueJobs} label="overdue" tone="red" />
                            <StatusPill count={v.status.dueThisWeek} label="due" tone="amber" />
                            <StatusPill count={v.status.expiringCerts} label="certs" tone="amber" />
                            <StatusPill
                              count={v.status.pendingApprovals}
                              label="approvals"
                              tone="blue"
                            />
                            <StatusPill
                              count={v.status.openFindings}
                              label="findings"
                              tone="neutral"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Budget vs actuals */}
              {budgetData && budgetData.budgets.length > 0 && (
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #E5E3DA',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '11px 16px',
                      borderBottom: '1px solid #EEEBE2',
                      background: '#F4F2EC',
                    }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0A1F33' }}>
                      Budget vs Actuals — {year}
                    </span>
                  </div>
                  {budgetData.budgets.map((b) => {
                    const pct =
                      b.totalBudgeted > 0
                        ? Math.min((b.totalActual / b.totalBudgeted) * 100, 100)
                        : 0;
                    const barColor = pct > 90 ? '#AB382E' : pct > 70 ? '#B5731E' : '#2F7D4F';
                    return (
                      <div
                        key={b.id}
                        style={{ padding: '12px 16px', borderTop: '1px solid #EEEBE2' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#0A1F33' }}>
                            {b.name}
                          </span>
                          <span style={{ fontSize: 11, color: '#8893A0' }}>
                            {b.currency}{' '}
                            {b.totalActual.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            {' / '}
                            {b.totalBudgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: '#EEEBE2',
                            borderRadius: 99,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: barColor,
                              borderRadius: 99,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 10.5, color: '#8893A0', marginTop: 4 }}>
                          {pct.toFixed(0)}% consumed
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: worklist */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #E5E3DA',
                borderRadius: 10,
                overflow: 'hidden',
                height: 'fit-content',
              }}
            >
              <div
                style={{
                  padding: '11px 16px',
                  borderBottom: '1px solid #EEEBE2',
                  background: '#F4F2EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0A1F33' }}>Worklist</span>
                <span style={{ fontSize: 11, color: '#8893A0' }}>{worklist.length} items</span>
              </div>

              {worklist.length === 0 ? (
                <div
                  style={{
                    padding: '28px 16px',
                    textAlign: 'center',
                    color: '#8893A0',
                    fontSize: 12,
                  }}
                >
                  All clear — nothing needs attention
                </div>
              ) : (
                worklist.map((item) => {
                  const { bg, fg } = SIG[item.severity];
                  const typeLabel: Record<string, string> = {
                    JOB_OVERDUE: 'Overdue',
                    REQUISITION_PENDING: 'Approval',
                    CERT_EXPIRING: 'Cert',
                    FINDING_OPEN: 'Finding',
                  };
                  return (
                    <div
                      key={item.entityId}
                      style={{
                        padding: '10px 16px',
                        borderTop: '1px solid #EEEBE2',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          background: bg,
                          color: fg,
                          fontSize: 9.5,
                          fontWeight: 600,
                          padding: '2px 5px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {typeLabel[item.type] ?? item.type}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#0A1F33',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.description}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#8893A0', marginTop: 1 }}>
                          {item.vesselName}
                          {item.dueAt && (
                            <>
                              {' · '}
                              {new Date(item.dueAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
