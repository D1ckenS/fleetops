import { useTranslation } from 'react-i18next';
import { LANGUAGES, applyLang } from '../i18n.js';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]!;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={current.code}
        onChange={(e) => applyLang(e.target.value)}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: '1px solid #E5E3DA',
          borderRadius: 6,
          padding: '4px 28px 4px 8px',
          fontSize: 12,
          fontWeight: 600,
          color: '#41546A',
          cursor: 'pointer',
          fontFamily: 'inherit',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2341546A'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
        aria-label="Select language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label} — {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}
