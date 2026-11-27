import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { LIMITS } from './limits'

let instance: FFmpeg | null = null
let loading: Promise<FFmpeg> | null = null

/** Carga el motor una sola vez (unos 30 MB la primera vez; luego queda en caché). */
export function loadFFmpeg(): Promise<FFmpeg> {
  if (instance) return Promise.resolve(instance)
  loading ??= (async () => {
    const ff = new FFmpeg()
    await ff.load({ coreURL, wasmURL })
    instance = ff
    return ff
  })().catch((e) => {
    loading = null
    throw e
  })
  return loading
}

export type Crop = { x: number; y: number; w: number; h: number }

export type ExportOptions = {
  /** Video fuente (se recorta con `crop`) o, para imágenes, el cuadro 512x512 ya dibujado. */
  visual: { kind: 'video'; file: File; start: number; crop: Crop; whole: boolean; box: { w: number; h: number }; bg: string } | { kind: 'image'; frame: Blob }
  /** Audio aparte (archivo o voz) y desde dónde se usa. */
  audio: { file: File; start: number } | null
  /** Segundos de material fuente que entran al sticker (antes de aplicar la velocidad). */
  sourceLength: number
  speed: number
  fade: number
  volOrig: number
  volAdd: number
  overlay: Blob | null
  onProgress?: (fraction: number) => void
}

/** Si ffmpeg se atasca (filtro inválido, memoria), corta en vez de dejar la pantalla en "exportando". */
const EXEC_TIMEOUT = 150_000
const num = (n: number) => Number(n.toFixed(3)).toString()
const extOf = (file: File, fallback: string) => (file.name.split('.').pop() ?? fallback).toLowerCase().replace(/[^a-z0-9]/g, '') || fallback

async function hasAudioStream(ff: FFmpeg, name: string): Promise<boolean> {
  const lines: string[] = []
  const onLog = ({ message }: { message: string }) => lines.push(message)
  ff.on('log', onLog)
  try {
    await ff.exec(['-hide_banner', '-i', name])
  } finally {
    ff.off('log', onLog)
  }
  return lines.some((l) => /Stream #.*Audio/.test(l))
}

/** Resultado del formato WhatsApp: sticker animado con transparencia + audio Opus aparte. */
export type WaExport = { webp: Uint8Array; opus: Uint8Array; seconds: number }

/** Construye el MP4 (H.264 + AAC, 512x512): recorte, mezcla de sonidos, velocidad, fundido y texto. */
export async function exportSticker(o: ExportOptions): Promise<Blob> {
  const r = await run(o, false)
  return r as Blob
}

/**
 * Construye el sticker para WhatsApp: WebP animado (con transparencia si el formato es "completo")
 * y el audio en Opus mono. Necesita sonido; el EXIF con el hash se agrega después (wasticker.ts).
 */
export async function exportWaSticker(o: ExportOptions): Promise<WaExport> {
  return (await run(o, true)) as WaExport
}

const WA_MAX_WEBP = 950_000
const WA_QUALITIES = [60, 48, 38, 28, 20]

async function run(o: ExportOptions, wa: boolean): Promise<Blob | WaExport> {
  const ff = await loadFFmpeg()
  const handler = ({ progress }: { progress: number }) => o.onProgress?.(Math.min(1, Math.max(0, progress)))
  const written: string[] = []
  const put = async (name: string, data: Blob | File) => {
    await ff.writeFile(name, await fetchFile(data))
    written.push(name)
  }
  ff.on('progress', handler)
  try {
    const speed = o.speed
    const outLen = o.sourceLength / speed
    const fade = Math.min(o.fade, outLen / 2)
    const args: string[] = []
    let next = 0
    const idx = { visual: next++, audio: -1, overlay: -1 }

    // ── Entradas ──
    let origAudio = false
    if (o.visual.kind === 'video') {
      const name = `in-video.${extOf(o.visual.file, 'mp4')}`
      await put(name, o.visual.file)
      origAudio = await hasAudioStream(ff, name)
      args.push('-ss', num(o.visual.start), '-t', num(o.sourceLength), '-i', name)
    } else {
      await put('frame.png', o.visual.frame)
      args.push('-loop', '1', '-framerate', '30', '-t', num(o.sourceLength), '-i', 'frame.png')
    }
    if (o.audio) {
      const name = `in-audio.${extOf(o.audio.file, 'wav')}`
      await put(name, o.audio.file)
      idx.audio = next++
      args.push('-ss', num(o.audio.start), '-t', num(o.sourceLength), '-i', name)
    }
    if (o.overlay) {
      await put('overlay.png', o.overlay)
      idx.overlay = next++
      args.push('-i', 'overlay.png')
    }

    // ── Video ──
    const size = LIMITS.outputSize
    const fps = wa ? 15 : 30
    const pf = wa ? 'rgba' : 'yuv420p'
    const chain: string[] = []
    const src = `[${idx.visual}:v]`
    if (o.visual.kind === 'video') {
      const { crop, box, bg, whole } = o.visual
      const fg = whole
        ? `scale=${box.w}:${box.h}:force_original_aspect_ratio=decrease:flags=lanczos`
        : `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${box.w}:${box.h}:flags=lanczos`
      const exact = !whole && box.w === size && box.h === size
      if (exact) {
        chain.push(`${src}${fg},setsar=1,fps=${fps},format=${pf}[v0]`)
      } else if (bg === 'blur') {
        chain.push(`${src}split=2[sa][sb]`)
        chain.push(`[sa]scale=${size}:${size}:force_original_aspect_ratio=increase,crop=${size}:${size},boxblur=16:2[sbg]`)
        chain.push(`[sb]${fg}[sfg]`)
        chain.push(`[sbg][sfg]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=${fps},format=${pf}[v0]`)
      } else {
        // Transparente: en WebP queda alfa real; en MP4 (sin alfa) el sobrante sale negro.
        const color = bg === 'transparent' ? (wa ? 'black@0' : 'black') : `0x${bg.replace('#', '')}`
        const rgba = wa ? 'format=rgba,' : ''
        chain.push(`${src}${fg},${rgba}pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=${color},setsar=1,fps=${fps},format=${pf}[v0]`)
      }
    } else {
      chain.push(`${src}scale=${size}:${size},setsar=1,fps=${fps},format=${pf}[v0]`)
    }
    let v = 'v0'
    if (o.overlay) {
      chain.push(`[${v}][${idx.overlay}:v]overlay=0:0:format=auto,format=${pf}[v1]`)
      v = 'v1'
    }
    const vFx: string[] = []
    if (speed !== 1) vFx.push(`setpts=PTS/${num(speed)}`)
    if (fade > 0) {
      const al = wa ? ':alpha=1' : ''
      vFx.push(`fade=t=in:st=0:d=${num(fade)}${al}`, `fade=t=out:st=${num(outLen - fade)}:d=${num(fade)}${al}`)
    }
    chain.push(`[${v}]${vFx.length ? vFx.join(',') : 'null'}[vout]`)

    // ── Audio ──
    const sources: string[] = []
    const useOrig = origAudio && (o.audio === null || o.volOrig > 0)
    if (useOrig) {
      chain.push(`[${idx.visual}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${num(o.volOrig)}[ao]`)
      sources.push('ao')
    }
    if (o.audio) {
      chain.push(`[${idx.audio}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${num(o.volAdd)}[aa]`)
      sources.push('aa')
    }
    const hasAudio = sources.length > 0
    if (hasAudio) {
      let a = sources[0]
      if (sources.length === 2) {
        chain.push('[ao][aa]amix=inputs=2:duration=longest:normalize=0[am]')
        a = 'am'
      }
      const aFx = [`apad=whole_dur=${num(o.sourceLength)}`]
      if (speed !== 1) aFx.push(`atempo=${num(speed)}`)
      if (fade > 0) aFx.push(`afade=t=in:st=0:d=${num(fade)}`, `afade=t=out:st=${num(outLen - fade)}:d=${num(fade)}`)
      chain.push(`[${a}]${aFx.join(',')}[aout]`)
    }

    if (wa) {
      if (!hasAudio) throw new Error('NO_AUDIO')
      const seconds = Math.min(10, Math.max(1, Math.ceil(outLen)))
      let webp: Uint8Array | null = null
      for (const q of WA_QUALITIES) {
        const c = await ff.exec([
          ...args,
          '-filter_complex', chain.join(';'),
          '-map', '[vout]', '-an', '-c:v', 'libwebp_anim', '-lossless', '0', '-q:v', String(q),
          '-compression_level', '5', '-loop', '0', '-t', num(outLen), '-y', 'out.webp',
          '-map', '[aout]', '-vn', '-c:a', 'libopus', '-b:a', '32k', '-ac', '1', '-ar', '48000',
          '-t', num(outLen), '-y', 'out.ogg',
        ], EXEC_TIMEOUT)
        if (c !== 0) throw new Error(`ffmpeg exit ${c}`)
        webp = (await ff.readFile('out.webp')) as Uint8Array
        if (webp.length <= WA_MAX_WEBP) break
      }
      if (!webp || webp.length > WA_MAX_WEBP) throw new Error('TOO_BIG')
      const opus = (await ff.readFile('out.ogg')) as Uint8Array
      o.onProgress?.(1)
      return { webp: webp.slice(), opus: opus.slice(), seconds }
    }

    const code = await ff.exec([
      ...args,
      '-filter_complex', chain.join(';'),
      '-map', '[vout]',
      ...(hasAudio ? ['-map', '[aout]'] : ['-an']),
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p',
      ...(hasAudio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : []),
      '-t', num(outLen), '-movflags', '+faststart', '-y', 'out.mp4',
    ], EXEC_TIMEOUT)
    if (code !== 0) throw new Error(`ffmpeg exit ${code}`)
    const data = (await ff.readFile('out.mp4')) as Uint8Array
    o.onProgress?.(1)
    return new Blob([data.slice().buffer], { type: 'video/mp4' })
  } finally {
    ff.off('progress', handler)
    for (const name of [...written, 'out.mp4', 'out.webp', 'out.ogg']) await ff.deleteFile(name).catch(() => {})
  }
}
