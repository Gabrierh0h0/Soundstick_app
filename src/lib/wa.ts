import { Capacitor, registerPlugin } from '@capacitor/core'

type WaState = { state: 'not_initialized' | 'unlinked' | 'linked'; lastEvent: string }

interface WaCorePlugin {
  state(): Promise<WaState>
  pair(o: { phone: string }): Promise<{ code: string }>
  send(o: { webp: string; audio: string; seconds: number; emojis: string }): Promise<void>
  unlink(): Promise<void>
  keepAlive(o: { on: boolean }): Promise<void>
  insets(): Promise<{ top: number; bottom: number }>
}

const Core = registerPlugin<WaCorePlugin>('WaCore')

/** Solo existe dentro de la app Android; en el navegador el envío directo no está disponible. */
export const waAvailable = (): boolean => Capacitor.isNativePlatform()

function b64(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

export const waState = () => Core.state()
export const waPair = (phone: string) => Core.pair({ phone: phone.replace(/\D/g, '') })
export const waUnlink = () => Core.unlink()
export const waKeepAlive = (on: boolean) => Core.keepAlive({ on }).catch(() => {})
export const waSend = (webp: Uint8Array, audio: Uint8Array, seconds: number, emojis = '\u{1F3B5}') =>
  Core.send({ webp: b64(webp), audio: b64(audio), seconds, emojis })

/** Los errores del núcleo llegan como códigos; devuelve la clave de texto para mostrar. */
export function waErrorKey(e: unknown): string {
  const m = String((e as { message?: string })?.message ?? e)
  if (/rate-overlimit/.test(m)) return 'waErrPairRate'
  if (/bad-request|not-acceptable/.test(m) && m.startsWith('PAIR')) return 'waErrPhone'
  const code = m.split(':')[0].trim()
  return (
    {
      RATE_LIMIT_GAP: 'waErrGap',
      RATE_LIMIT_HOUR: 'waErrHour',
      NOT_LINKED: 'waErrNotLinked',
      PAIR_WAIT: 'waErrPairWait',
      PAIR_DAILY: 'waErrPairRate',
      PHONE_INVALID: 'waErrPhone',
      NO_AUDIO: 'waErrNoAudio',
      BAD_AUDIO: 'waErrBadAudio',
      TOO_BIG: 'waErrBig',
      CONNECT: 'waErrConnect',
      CONNECT_TIMEOUT: 'waErrConnect',
    } as Record<string, string>
  )[code] ?? 'waErrGeneric'
}

/** En Android, pasa las barras del sistema a la hoja de estilos (--safe-area-inset-*). */
export async function applyInsets(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  const set = async () => {
    try {
      const { top, bottom } = await Core.insets()
      const root = document.documentElement.style
      root.setProperty('--safe-area-inset-top', `${top}px`)
      root.setProperty('--safe-area-inset-bottom', `${bottom}px`)
    } catch { /* sin plugin: se queda en cero */ }
  }
  await set()
  window.addEventListener('resize', () => void set())
}
