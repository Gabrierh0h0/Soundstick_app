export type AudioInfo = { peaks: number[]; duration: number }

/** Decodifica un audio: duración y picos de volumen (0-1). Devuelve null si el navegador no lo entiende. */
export async function readAudio(file: Blob, bars: number): Promise<AudioInfo | null> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  const ctx = new Ctx()
  try {
    const audio = await ctx.decodeAudioData(await file.arrayBuffer())
    const data = audio.getChannelData(0)
    const block = Math.max(1, Math.floor(data.length / bars))
    const peaks: number[] = []
    for (let i = 0; i < bars; i++) {
      let max = 0
      const end = Math.min(data.length, (i + 1) * block)
      for (let j = i * block; j < end; j += 8) max = Math.max(max, Math.abs(data[j]))
      peaks.push(max)
    }
    const top = Math.max(...peaks, 0.001)
    return { peaks: peaks.map((p) => Math.max(0.06, p / top)), duration: audio.duration }
  } catch {
    return null
  } finally {
    ctx.close().catch(() => {})
  }
}

function audioCtx(): AudioContext | null {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  return Ctx ? new Ctx() : null
}

/** Duración real y pico máximo (0-1) de un audio ya codificado; null si no se puede decodificar. */
export async function analyzeAudio(data: Blob | Uint8Array): Promise<{ duration: number; peak: number } | null> {
  const ctx = audioCtx()
  if (!ctx) return null
  try {
    const buf = data instanceof Blob ? await data.arrayBuffer() : (data.slice().buffer as ArrayBuffer)
    const audio = await ctx.decodeAudioData(buf)
    let peak = 0
    for (let c = 0; c < audio.numberOfChannels; c++) {
      const d = audio.getChannelData(c)
      for (let i = 0; i < d.length; i += 4) peak = Math.max(peak, Math.abs(d[i]))
    }
    return { duration: audio.duration, peak }
  } catch {
    return null
  } finally {
    ctx.close().catch(() => {})
  }
}

function wavBlob(samples: Float32Array, rate: number): Blob {
  const out = new DataView(new ArrayBuffer(44 + samples.length * 2))
  const str = (o: number, t: string) => { for (let i = 0; i < t.length; i++) out.setUint8(o + i, t.charCodeAt(i)) }
  str(0, 'RIFF'); out.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ')
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true)
  out.setUint32(24, rate, true); out.setUint32(28, rate * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true)
  str(36, 'data'); out.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true)
  return new Blob([out.buffer], { type: 'audio/wav' })
}

/**
 * Convierte una grabación del micrófono (webm/ogg/m4a con duración y marcas de tiempo variables según el teléfono)
 * a un WAV mono limpio con el volumen normalizado. Así el resto del proceso siempre recibe el mismo tipo de audio.
 * Devuelve null si no se pudo leer o si la grabación quedó en silencio.
 */
export async function normalizeRecording(file: Blob): Promise<File | null> {
  const ctx = audioCtx()
  if (!ctx) return null
  try {
    const audio = await ctx.decodeAudioData(await file.arrayBuffer())
    const mono = new Float32Array(audio.length)
    for (let c = 0; c < audio.numberOfChannels; c++) {
      const d = audio.getChannelData(c)
      for (let i = 0; i < d.length; i++) mono[i] += d[i] / audio.numberOfChannels
    }
    let peak = 0
    for (let i = 0; i < mono.length; i++) peak = Math.max(peak, Math.abs(mono[i]))
    if (peak < 0.004) return null
    const gain = Math.min(10, 0.9 / peak)
    for (let i = 0; i < mono.length; i++) mono[i] *= gain
    return new File([wavBlob(mono, audio.sampleRate)], 'voz.wav', { type: 'audio/wav' })
  } catch {
    return null
  } finally {
    ctx.close().catch(() => {})
  }
}
