import { LIMITS } from './limits'

type Opts = {
  url: string
  /** Segundo del video donde empieza y cuántos segundos se toman. */
  start: number
  length: number
  fps: number
  crop: { x: number; y: number; w: number; h: number }
  box: { w: number; h: number }
  bg: string
  onProgress?: (fraction: number) => void
}

type VideoWithFrames = HTMLVideoElement & {
  requestVideoFrameCallback: (cb: (now: number, meta: { mediaTime: number }) => void) => number
}

/** ¿El WebView puede avisar cuadro a cuadro mientras reproduce? Sin eso se usa el camino lento por ffmpeg. */
export const canCaptureFrames = () => typeof HTMLVideoElement !== 'undefined' && 'requestVideoFrameCallback' in HTMLVideoElement.prototype

function draw(v: HTMLVideoElement, o: Opts): Promise<Blob> {
  const size = LIMITS.outputSize
  const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size })
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  if (o.bg === 'blur') {
    const cover = size / Math.min(v.videoWidth, v.videoHeight)
    ctx.filter = 'blur(14px)'
    ctx.drawImage(v, (size - v.videoWidth * cover) / 2 - 20, (size - v.videoHeight * cover) / 2 - 20, v.videoWidth * cover + 40, v.videoHeight * cover + 40)
    ctx.filter = 'none'
  } else if (o.bg !== 'transparent') {
    ctx.fillStyle = o.bg
    ctx.fillRect(0, 0, size, size)
  }
  const c = o.crop
  ctx.drawImage(v, c.x, c.y, c.w, c.h, (size - o.box.w) / 2, (size - o.box.h) / 2, o.box.w, o.box.h)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png'))
}

/**
 * Saca los cuadros ya recortados (512x512 con transparencia) reproduciendo el video con el decodificador del teléfono,
 * que es mucho más rápido que decodificarlo con ffmpeg compilado a WebAssembly. Dura lo mismo que el clip.
 */
export async function captureFrames(o: Opts): Promise<Blob[]> {
  const v = document.createElement('video') as VideoWithFrames
  v.muted = true
  v.playsInline = true
  v.preload = 'auto'
  v.src = o.url
  try {
    await new Promise<void>((resolve, reject) => {
      v.onloadeddata = () => resolve()
      v.onerror = () => reject(new Error('frames-load'))
    })
    v.currentTime = o.start
    await new Promise<void>((resolve) => {
      v.onseeked = () => resolve()
      window.setTimeout(resolve, 3000)
    })
    const total = Math.max(1, Math.floor(o.length * o.fps))
    const out: Promise<Blob>[] = []
    await new Promise<void>((resolve, reject) => {
      const guard = window.setTimeout(() => reject(new Error('frames-timeout')), (o.length + 8) * 1000)
      const done = () => {
        window.clearTimeout(guard)
        resolve()
      }
      const tick = (_now: number, meta: { mediaTime: number }) => {
        const t = meta.mediaTime - o.start
        while (out.length < total && t + 0.5 / o.fps >= out.length / o.fps) out.push(draw(v, o))
        o.onProgress?.(out.length / total)
        if (out.length >= total || v.ended) return done()
        v.requestVideoFrameCallback(tick)
      }
      v.requestVideoFrameCallback(tick)
      v.onended = () => done()
      v.play().catch(reject)
    })
    v.pause()
    const last = out[out.length - 1]
    while (out.length < total) out.push(last) // el video terminó antes: repite el último cuadro
    return await Promise.all(out)
  } finally {
    v.pause()
    v.removeAttribute('src')
    v.load()
  }
}
