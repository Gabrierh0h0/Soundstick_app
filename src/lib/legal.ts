import type { Key } from './i18n'

const BASE = 'https://github.com/Gabrierh0h0/Soundstick_app/blob/main/'
export const LEGAL_VERSION = '2026-11-27'

export const LEGAL_DOCS: { key: Key; url: string }[] = [
  { key: 'lgPrivacy', url: BASE + 'legal/PRIVACY.md' },
  { key: 'lgTerms', url: BASE + 'legal/TERMS.md' },
  { key: 'lgDisclaimer', url: BASE + 'legal/DISCLAIMER.md' },
  { key: 'lgData', url: BASE + 'legal/DATA-POLICY-CO.md' },
  { key: 'lgUse', url: BASE + 'legal/ACCEPTABLE-USE.md' },
  { key: 'lgCopyright', url: BASE + 'legal/COPYRIGHT.md' },
  { key: 'lgThird', url: BASE + 'legal/THIRD-PARTY-NOTICES.md' },
  { key: 'lgSecurity', url: BASE + 'SECURITY.md' },
  { key: 'lgPerms', url: BASE + 'legal/PERMISSIONS-AND-STORAGE.md' },
]

export const URL_TERMS = BASE + 'legal/TERMS.md'
export const URL_PRIVACY = BASE + 'legal/PRIVACY.md'

const KEY = 'soundstick.legal'
export const legalAccepted = () => { try { return localStorage.getItem(KEY) === LEGAL_VERSION } catch { return false } }
export const acceptLegal = () => { try { localStorage.setItem(KEY, LEGAL_VERSION) } catch { /* sin almacenamiento */ } }
