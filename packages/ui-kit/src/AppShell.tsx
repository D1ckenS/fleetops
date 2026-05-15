import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  href: string;
  code: string;
}

interface AppShellProps {
  nav: NavItem[];
  currentPath: string;
  onNavClick: (href: string) => void;
  userEmail?: string;
  onLogout?: () => void;
  children: ReactNode;
}

function BearingMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10.25" fill="none" stroke="#0A1F33" strokeWidth="1.5" />
      <circle cx="12" cy="8.5" r="2" fill="#0A1F33" />
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="3.25"
        stroke="#0A1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ModBadge({ code, active }: { code: string; active: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        borderRadius: 5,
        flexShrink: 0,
        background: active ? '#0A1F33' : 'transparent',
        color: active ? '#fff' : '#8893A0',
        fontFamily: '"Geist Mono", monospace',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.04em',
        border: active ? 'none' : '1px solid #EEEBE2',
      }}
    >
      {code}
    </span>
  );
}

export function AppShell({
  nav,
  currentPath,
  onNavClick,
  userEmail,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#FAFAF7',
        fontFamily: '"Geist", system-ui, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: '#FFFFFF',
          borderRight: '1px solid #E5E3DA',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 14px 12px',
            borderBottom: '1px solid #EEEBE2',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BearingMark size={20} />
          <span
            style={{
              fontFamily: '"Geist", system-ui',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '-0.01em',
              color: '#0A1F33',
            }}
          >
            FleetOps
          </span>
        </div>
        <nav
          style={{
            flex: 1,
            padding: '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            overflowY: 'auto',
          }}
        >
          {nav.map((item) => {
            const active =
              item.href === '/' ? currentPath === '/' : currentPath.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => onNavClick(item.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 8px',
                  height: 32,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: active ? '#F4F2EC' : 'transparent',
                  color: active ? '#0A1F33' : '#41546A',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background .1s',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = '#F4F2EC';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <ModBadge code={item.code} active={active} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
        {userEmail && (
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #EEEBE2',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <p
              style={{
                fontSize: 11.5,
                color: '#8893A0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {userEmail}
            </p>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 11.5,
                  color: '#8893A0',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#AB382E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8893A0';
                }}
              >
                Sign out
              </button>
            )}
          </div>
        )}
      </aside>
      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>{children}</div>
      </main>
    </div>
  );
}
