// shortcut: curated list of golf countries; swap for a full ISO 3166 list if users ask for more.
export const COUNTRIES = ['AT', 'DE', 'CH', 'IT', 'NL', 'BE', 'LU', 'DK', 'SE', 'NO', 'FI', 'GB', 'IE', 'FR', 'ES', 'PT', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'US', 'CA', 'AU', 'NZ', 'ZA', 'JP', 'KR', 'AE'] as const;

export function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
