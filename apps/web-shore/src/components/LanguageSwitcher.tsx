import { useTranslation } from 'react-i18next';
import { Select } from '@fleetops/ui-kit';
import { LANGUAGES, applyLang } from '../i18n.js';

interface Props {
  size?: 'sm' | 'md';
}

export function LanguageSwitcher({ size = 'sm' }: Props) {
  const { i18n } = useTranslation();

  const options = LANGUAGES.map((l) => ({
    value: l.code,
    label: `${l.label} — ${l.name}`,
  }));

  return (
    <Select
      options={options}
      value={i18n.language}
      onChange={applyLang}
      size={size}
      placement={size === 'sm' ? 'top' : 'bottom'}
    />
  );
}
