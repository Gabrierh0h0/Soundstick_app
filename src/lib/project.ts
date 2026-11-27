export type Mode = 'video' | 'videoAudio' | 'imageAudio' | 'voice'

/** Lo que se ve: un video (con o sin su sonido) o una imagen fija. */
export type Visual = { kind: 'video' | 'image'; file: File; url: string; width: number; height: number; duration: number }

/** Sonido aparte: un archivo subido o una grabación de voz. */
export type AudioClip = { kind: 'file' | 'voice'; file: File; url: string; duration: number; peaks: number[] }

export type TextPos = 'top' | 'center' | 'bottom'

/** Proporciones fijas del recuadro; "libre" deja elegir cualquier forma. */
export type AspectId = 'free' | '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
export const ASPECTS: { id: AspectId; ratio: number | null }[] = [
  { id: 'free', ratio: null },
  { id: '1:1', ratio: 1 },
  { id: '16:9', ratio: 16 / 9 },
  { id: '9:16', ratio: 9 / 16 },
  { id: '4:3', ratio: 4 / 3 },
  { id: '3:4', ratio: 3 / 4 },
]

/** Medidas (pares) donde cae el recorte dentro del lienzo cuadrado; lo que sobra queda transparente o con el fondo elegido. */
export function boxFor(w: number, h: number, size = 512): { w: number; h: number } {
  const r = w / h
  const even = (n: number) => Math.max(16, Math.round(n / 2) * 2)
  return r >= 1 ? { w: size, h: even(size / r) } : { w: even(size * r), h: size }
}

export type Effects = {
  speed: number
  fade: number
  /** Volumen del sonido original del video (0-1.5). */
  volOrig: number
  /** Volumen del audio añadido o de la voz (0-1.5). */
  volAdd: number
  text: string
  textPos: TextPos
  textColor: string
  textSize: number
  /** Lo que rodea la imagen: 'transparent', 'blur' (el mismo contenido borroso) o un color. */
  bg: string
}

export const DEFAULT_FX: Effects = {
  speed: 1,
  fade: 0,
  volOrig: 1,
  volAdd: 1,
  text: '',
  textPos: 'bottom',
  textColor: '#ffffff',
  textSize: 64,
  bg: 'transparent',
}

export const needsAudio = (m: Mode) => m !== 'video'
export const wantsVideoOnly = (m: Mode) => m === 'video' || m === 'videoAudio'
export const wantsImageOnly = (m: Mode) => m === 'imageAudio'

/** Al cambiar de modo, el sonido original solo se conserva cuando no hay audio que lo reemplace. */
export const defaultOrigVolume = (m: Mode) => (m === 'video' ? 1 : 0)

export const BG_COLORS = ['#000000', '#ffffff', '#9ccc00', '#00aeef', '#e3008c', '#ffd400'] as const
export const TEXT_COLORS = ['#ffffff', '#9ccc00', '#00aeef', '#e3008c', '#ffd400'] as const
