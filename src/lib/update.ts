import { Capacitor } from '@capacitor/core'

export const APP_VERSION = __APP_VERSION__
const REPO = 'Gabrierh0h0/Soundstick_app'
export const APK_URL = `https://github.com/${REPO}/releases/latest/download/soundstick.apk`
const LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`

export type Update = { version: string; url: string; notes: string }

/** true si `a` es una versión posterior a `b` (formato 1.2.3). */
export function isNewer(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d > 0
  }
  return false
}

/** Consulta el último release de GitHub (etiqueta v1.2.3). Solo en la app Android; cualquier fallo se ignora. */
export async function checkUpdate(): Promise<Update | null> {
  if (!Capacitor.isNativePlatform()) return null
  try {
    const r = await fetch(LATEST_URL, { headers: { Accept: 'application/vnd.github+json' } })
    if (!r.ok) return null
    const j = (await r.json()) as { tag_name?: string; body?: string; html_url?: string }
    const version = (j.tag_name ?? '').replace(/^v/i, '')
    if (!/^\d+\.\d+\.\d+$/.test(version) || !isNewer(version, APP_VERSION)) return null
    return { version, url: APK_URL, notes: j.body ?? '' }
  } catch {
    return null
  }
}
