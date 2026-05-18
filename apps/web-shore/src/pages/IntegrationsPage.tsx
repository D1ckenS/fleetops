import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface SsoConfig {
  provider: 'ENTRA' | 'GOOGLE';
  discoveryUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  enabled: boolean;
}

const GOOGLE_DISCOVERY_URL = 'https://accounts.google.com';
const DEFAULT_REDIRECT_URI =
  typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';

interface TechLibraryConfig {
  provider: 'TWO_BA' | 'NARETO';
  apiKey: string;
  endpoint: string | null;
  enabled: boolean;
}

interface AccountingConfig {
  provider: string;
  enabled: boolean;
}

type Tab = 'sso' | 'tech-library' | 'accounting';

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
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
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0A1F33' }}>{title}</span>
      </div>
      <div style={{ padding: '16px' }}>{children}</div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: '#41546A',
          marginBottom: 5,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #E5E3DA',
          borderRadius: 6,
          fontSize: 13,
          color: '#0A1F33',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {hint && <p style={{ fontSize: 11, color: '#8893A0', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '8px 20px',
        background: '#0A1F33',
        color: '#fff',
        border: 'none',
        borderRadius: 7,
        fontSize: 12.5,
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Saving…' : 'Save'}
    </button>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      style={{
        background: ok ? '#E2EEE6' : '#F4F2EC',
        color: ok ? '#2F7D4F' : '#8893A0',
        fontSize: 10.5,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
      }}
    >
      {ok ? 'Configured' : 'Not configured'}
    </span>
  );
}

// ── SSO Tab ──────────────────────────────────────────────────────────────────

function SsoTab() {
  const [configs, setConfigs] = useState<SsoConfig[]>([]);

  useEffect(() => {
    api
      .get<SsoConfig[]>('/auth/oidc/configs')
      .then((cs) => setConfigs(Array.isArray(cs) ? cs : []))
      .catch(() => {});
  }, []);

  const entra = configs.find((c) => c.provider === 'ENTRA');
  const google = configs.find((c) => c.provider === 'GOOGLE');

  return (
    <>
      <SectionCard title="Microsoft Entra SSO">
        <p style={{ fontSize: 12.5, color: '#41546A', marginBottom: 16 }}>
          Allow users to sign in with their Microsoft / Azure AD account.{' '}
          <a
            href="https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1F5B9D' }}
          >
            Microsoft docs ↗
          </a>
        </p>
        <ProviderForm
          providerKey="ENTRA"
          initial={entra}
          buildDiscoveryUrl={(dirId) =>
            dirId ? `https://login.microsoftonline.com/${dirId}/v2.0` : ''
          }
        />
      </SectionCard>

      <SectionCard title="Google SSO">
        <p style={{ fontSize: 12.5, color: '#41546A', marginBottom: 16 }}>
          Allow users to sign in with their Google account. Create an OAuth 2.0 Web Application
          client in Google Cloud Console.{' '}
          <a
            href="https://developers.google.com/identity/openid-connect/openid-connect#appsetup"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1F5B9D' }}
          >
            Google docs ↗
          </a>
        </p>
        <ProviderForm providerKey="GOOGLE" initial={google} discoveryUrl={GOOGLE_DISCOVERY_URL} />
      </SectionCard>

      <SectionCard title="How SSO login works">
        <ol
          style={{ fontSize: 12.5, color: '#41546A', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}
        >
          <li>User enters the Organisation ID on the login page.</li>
          <li>User clicks "Sign in with Microsoft" or "Sign in with Google."</li>
          <li>FleetOps redirects to the chosen provider's login page.</li>
          <li>After authentication the provider redirects back to the Redirect URI above.</li>
          <li>FleetOps issues a session — new users are auto-provisioned with CREW role.</li>
        </ol>
      </SectionCard>
    </>
  );
}

// ── Reusable provider form ────────────────────────────────────────────────────

function ProviderForm({
  providerKey,
  initial,
  discoveryUrl: fixedDiscoveryUrl,
  buildDiscoveryUrl,
}: {
  providerKey: 'ENTRA' | 'GOOGLE';
  initial: SsoConfig | undefined;
  discoveryUrl?: string | undefined;
  buildDiscoveryUrl?: ((dirId: string) => string) | undefined;
}) {
  const [clientId, setClientId] = useState(initial?.clientId ?? '');
  const [clientSecret, setClientSecret] = useState(initial?.clientSecret ?? '');
  const [redirectUri, setRedirectUri] = useState(initial?.redirectUri ?? DEFAULT_REDIRECT_URI);
  const [dirId, setDirId] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const discoveryUrl = fixedDiscoveryUrl ?? (buildDiscoveryUrl ? buildDiscoveryUrl(dirId) : '');
      if (!discoveryUrl) {
        setMsg('Enter the Directory (Tenant) ID to construct the discovery URL.');
        return;
      }
      await api.post('/auth/oidc/config', {
        provider: providerKey,
        discoveryUrl,
        clientId,
        clientSecret,
        redirectUri,
        enabled: true,
      });
      setMsg('Saved.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {buildDiscoveryUrl && (
        <LabeledInput
          label="Directory (Tenant) ID"
          value={dirId}
          onChange={setDirId}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          hint='Use "common" to allow any Microsoft account.'
        />
      )}
      <LabeledInput
        label="Client ID"
        value={clientId}
        onChange={setClientId}
        placeholder={
          providerKey === 'GOOGLE'
            ? '123456789-abc.apps.googleusercontent.com'
            : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        }
      />
      <LabeledInput
        label="Client Secret"
        type="password"
        value={clientSecret}
        onChange={setClientSecret}
        placeholder="Your OAuth client secret"
      />
      <LabeledInput
        label="Redirect URI"
        value={redirectUri}
        onChange={setRedirectUri}
        placeholder={DEFAULT_REDIRECT_URI}
        hint="Must match the redirect URI in your provider's app settings exactly."
      />
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 8 }}
      >
        <StatusBadge ok={Boolean(clientId && clientSecret)} />
        {msg && (
          <span
            style={{
              fontSize: 12,
              color: msg === 'Saved.' ? '#2F7D4F' : '#AB382E',
            }}
          >
            {msg}
          </span>
        )}
      </div>
      <SaveBtn loading={saving} onClick={save} />
    </div>
  );
}

// ── Tech Library Tab ─────────────────────────────────────────────────────────

function TechLibraryTab() {
  const [cfg, setCfg] = useState<Partial<TechLibraryConfig>>({ provider: 'TWO_BA' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<TechLibraryConfig | null>('/tech-library/config')
      .then((c) => {
        if (c) setCfg(c);
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await api.post('/tech-library/config', cfg);
      setMsg('Tech library configuration saved.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="2BA / Nareto Part Lookup">
      <p style={{ fontSize: 12.5, color: '#41546A', marginBottom: 16 }}>
        Connect to the 2BA or Nareto technical product database to look up spare parts by part
        number or description. Requires a valid license and API key from the provider.
      </p>
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: '#41546A',
            marginBottom: 5,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Provider
        </label>
        <select
          value={cfg.provider ?? 'TWO_BA'}
          onChange={(e) =>
            setCfg((c) => ({ ...c, provider: e.target.value as 'TWO_BA' | 'NARETO' }))
          }
          style={{
            padding: '8px 10px',
            border: '1px solid #E5E3DA',
            borderRadius: 6,
            fontSize: 13,
            color: '#0A1F33',
          }}
        >
          <option value="TWO_BA">2BA (2ba.nl)</option>
          <option value="NARETO">Nareto</option>
        </select>
      </div>
      <LabeledInput
        label="API Key"
        type="password"
        value={cfg.apiKey ?? ''}
        onChange={(v) => setCfg((c) => ({ ...c, apiKey: v }))}
        placeholder="Your API key from the provider"
      />
      <LabeledInput
        label="Custom Endpoint (optional)"
        value={cfg.endpoint ?? ''}
        onChange={(v) => setCfg((c) => ({ ...c, endpoint: v || null }))}
        placeholder="Leave blank to use provider default"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <StatusBadge ok={Boolean(cfg.apiKey)} />
        {msg && (
          <span
            style={{
              fontSize: 12,
              color: msg.includes('failed') ? '#AB382E' : '#2F7D4F',
            }}
          >
            {msg}
          </span>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <SaveBtn loading={saving} onClick={save} />
      </div>
    </SectionCard>
  );
}

// ── Accounting Tab ───────────────────────────────────────────────────────────

function AccountingTab() {
  const [cfg, setCfg] = useState<Partial<AccountingConfig>>({ provider: 'CSV' });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [exportFrom, setExportFrom] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [exportTo, setExportTo] = useState(() => new Date().toISOString().split('T')[0]!);
  const [exportFormat, setExportFormat] = useState<'csv' | 'exact' | 'xlsx'>('xlsx');

  useEffect(() => {
    api
      .get<AccountingConfig | null>('/accounting/config')
      .then((c) => {
        if (c) setCfg(c);
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await api.post('/accounting/config', cfg);
      setMsg('Accounting configuration saved.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function triggerExport() {
    setExporting(true);
    const params = new URLSearchParams({ from: exportFrom, to: exportTo, format: exportFormat });
    const url = `/api/v1/accounting/export-pos?${params}`;
    const a = document.createElement('a');
    a.href = url;
    a.download =
      exportFormat === 'xlsx'
        ? 'purchase-orders.xlsx'
        : exportFormat === 'csv'
          ? 'purchase-orders.csv'
          : 'purchase-orders-exact.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setExporting(false), 1500);
  }

  return (
    <>
      <SectionCard title="Accounting System">
        <p style={{ fontSize: 12.5, color: '#41546A', marginBottom: 16 }}>
          Connect FleetOps to your accounting system. Purchase orders can be exported in CSV or
          Exact Online XML format for import into your accounting package.
        </p>
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              color: '#41546A',
              marginBottom: 5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Accounting system
          </label>
          <select
            value={cfg.provider ?? 'CSV'}
            onChange={(e) => setCfg((c) => ({ ...c, provider: e.target.value }))}
            style={{
              padding: '8px 10px',
              border: '1px solid #E5E3DA',
              borderRadius: 6,
              fontSize: 13,
              color: '#0A1F33',
            }}
          >
            <option value="CSV">CSV Export (generic)</option>
            <option value="EXACT">Exact Online</option>
            <option value="TWINFIELD">Twinfield</option>
            <option value="SAP">SAP</option>
            <option value="NETSUITE">NetSuite</option>
          </select>
        </div>
        {msg && (
          <p
            style={{
              fontSize: 12,
              color: msg.includes('failed') ? '#AB382E' : '#2F7D4F',
              marginBottom: 12,
            }}
          >
            {msg}
          </p>
        )}
        <SaveBtn loading={saving} onClick={save} />
      </SectionCard>

      <SectionCard title="Export Purchase Orders">
        <p style={{ fontSize: 12.5, color: '#41546A', marginBottom: 16 }}>
          Download purchase orders in your accounting system's import format.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: '#41546A',
                marginBottom: 5,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              From
            </label>
            <input
              type="date"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
              style={{
                padding: '7px 10px',
                border: '1px solid #E5E3DA',
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: '#41546A',
                marginBottom: 5,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              To
            </label>
            <input
              type="date"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
              style={{
                padding: '7px 10px',
                border: '1px solid #E5E3DA',
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: '#41546A',
                marginBottom: 5,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'exact' | 'xlsx')}
              style={{
                padding: '7px 10px',
                border: '1px solid #E5E3DA',
                borderRadius: 6,
                fontSize: 13,
                color: '#0A1F33',
              }}
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
              <option value="exact">Exact Online XML</option>
            </select>
          </div>
        </div>
        <button
          onClick={triggerExport}
          disabled={exporting}
          style={{
            padding: '8px 20px',
            background: '#0A1F33',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            fontSize: 12.5,
            fontWeight: 500,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? 'Downloading…' : 'Download export'}
        </button>
      </SectionCard>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function IntegrationsPage() {
  const [tab, setTab] = useState<Tab>('sso');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sso', label: 'Microsoft Entra SSO' },
    { key: 'tech-library', label: '2BA / Nareto' },
    { key: 'accounting', label: 'Accounting' },
  ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#0A1F33',
          marginBottom: 20,
          letterSpacing: '-0.011em',
        }}
      >
        Integrations
      </h1>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          padding: '5px 6px',
          background: '#F4F2EC',
          borderRadius: 8,
          border: '1px solid #EEEBE2',
          width: 'fit-content',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: tab === t.key ? '#0A1F33' : 'transparent',
              color: tab === t.key ? '#fff' : '#41546A',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sso' && <SsoTab />}
      {tab === 'tech-library' && <TechLibraryTab />}
      {tab === 'accounting' && <AccountingTab />}
    </div>
  );
}
