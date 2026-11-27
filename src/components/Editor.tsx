import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { useT, type Key } from '../lib/i18n'
import { analyzeAudio, normalizeRecording, readAudio } from '../lib/audio'
import { exportSticker, exportWaSticker, loadFFmpeg, type ExportOptions } from '../lib/ffmpeg'
import { buildExif, injectExif, sha256b64 } from '../lib/wasticker'
import { waAvailable, waErrorKey, waSend, waState } from '../lib/wa'
import { WaLink } from './WaLink'
import { LIMITS, MAX_AUDIO_BYTES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '../lib/limits'
import { saveSticker } from '../lib/library'
import { overlayBlob, overlayDataUrl, stickerFrameBlob } from '../lib/overlay'
import { ASPECTS, DEFAULT_FX, boxFor, defaultOrigVolume, needsAudio, type AudioClip, type AspectId, type Effects, type Mode, type Visual } from '../lib/project'
import { download, shareFile } from '../lib/share'
import { clampWindow, fmt, initialWindow, type Handle } from '../lib/trim'
import { usePlayback } from '../hooks/usePlayback'
import { fitCrop, Preview } from './Preview'
import type { Crop } from '../lib/ffmpeg'
import { makeThumbs } from '../lib/thumbs'
import { Tools } from './Tools'
import { ModeIcon } from './Icons'
import { Trim } from './Trim'
import { VoiceRecorder } from './VoiceRecorder'

type Phase = 'idle' | 'loading' | 'exporting'
type Message = { kind: 'error' | 'info'; text: string } | null
type Win = { start: number; end: number }

const VIDEO_NAME = /\.(mp4|mov|m4v|webm|mkv|3gp)$/i
const IMAGE_NAME = /\.(png|jpe?g|webp)$/i
const AUDIO_NAME = /\.(mp3|m4a|aac|wav|ogg|oga|opus|webm|flac|amr|3gp)$/i
const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1)

const MODES: { id: Mode; label: Key; short: Key }[] = [
  { id: 'video', label: 'srcVideo', short: 'mVideo' },
  { id: 'videoAudio', label: 'srcVideoAudio', short: 'mVideoAudio' },
  { id: 'imageAudio', label: 'srcImageAudio', short: 'mImage' },
  { id: 'voice', label: 'srcVoice', short: 'mVoice' },
]

const isVideoFile = (f: File) => f.type.startsWith('video/') || VIDEO_NAME.test(f.name)
const isImageFile = (f: File) => /^image\/(png|jpeg|webp)$/.test(f.type) || (!f.type && IMAGE_NAME.test(f.name))
const isAudioFile = (f: File) => f.type.startsWith('audio/') || AUDIO_NAME.test(f.name)

function loadVideo(url: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.onloadedmetadata = () => {
      if (v.videoWidth && v.videoHeight && Number.isFinite(v.duration)) resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration })
      else reject(new Error('metadata'))
    }
    v.onerror = () => reject(new Error('video'))
    v.src = url
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => (img.naturalWidth ? resolve(img) : reject(new Error('image')))
    img.onerror = () => reject(new Error('image'))
    img.src = url
  })
}

export function Editor({ onHelp }: { onHelp: () => void }) {
  const { t } = useT()
  const visInput = useRef<HTMLInputElement>(null)
  const audInput = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const cache = useRef<{ key: string; blob: Blob; saved: boolean } | null>(null)

  const [mode, setModeState] = useState<Mode>('video')
  const [visual, setVisual] = useState<Visual | null>(null)
  const [audio, setAudio] = useState<AudioClip | null>(null)
  const [vPeaks, setVPeaks] = useState<number[] | null>(null)
  const [vWin, setVWin] = useState<Win>({ start: 0, end: 0 })
  const [aWin, setAWin] = useState<Win>({ start: 0, end: 0 })
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, w: 1, h: 1 })
  const [aspect, setAspect] = useState<AspectId>('1:1')
  const [thumbs, setThumbs] = useState<string[] | null>(null)
  const [fx, setFx] = useState<Effects>(DEFAULT_FX)
  const [phase, setPhase] = useState<Phase>('idle')
  const [reading, setReading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<Message>(null)
  const [saved, setSaved] = useState(false)
  const [over, setOver] = useState(false)
  // El navegador exige un toque reciente para abrir "Compartir"; si exportar tardó, el botón queda armado para el siguiente toque.
  const [armedKey, setArmedKey] = useState('')

  const fail = useCallback((key: Key, vars?: Record<string, string | number>) => setMessage({ kind: 'error', text: t(key, vars) }), [t])
  const touch = () => { setSaved(false); setMessage(null) }

  const hasVideo = visual?.kind === 'video'
  const maxLen = LIMITS.maxSeconds * fx.speed
  const vLen = vWin.end - vWin.start
  const aLen = aWin.end - aWin.start
  const sourceLen = hasVideo ? vLen : audio ? aLen : 0
  const outLen = sourceLen / fx.speed

  const pb = usePlayback({
    hasVideo,
    hasAudio: !!audio,
    vWin,
    aWin,
    speed: fx.speed,
    volOrig: fx.volOrig,
    volAdd: fx.volAdd,
    videoRef,
    audioRef,
    mediaKey: `${visual?.url ?? ''}|${audio?.url ?? ''}`,
  })

  useEffect(() => {
    setThumbs(null)
    if (!visual || visual.kind !== 'video') return
    let alive = true
    makeThumbs(visual.url, visual.duration).then((t) => alive && setThumbs(t)).catch(() => {})
    return () => { alive = false }
  }, [visual?.url]) // eslint-disable-line react-hooks/exhaustive-deps

  const textStyle = fx.text.trim() ? { text: fx.text, textPos: fx.textPos, textColor: fx.textColor, textSize: fx.textSize } : null
  const overlay = useMemo(() => (textStyle ? overlayDataUrl(textStyle) : null), [fx.text, fx.textPos, fx.textColor, fx.textSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const drop = (url: string | undefined) => { if (url) URL.revokeObjectURL(url) }

  function setMode(next: Mode) {
    if (next === mode) return
    pb.pause()
    cache.current = null
    touch()
    // Cada modo conserva solo lo que le sirve.
    const keepVisual = visual && (next === 'voice' || (next === 'imageAudio' ? visual.kind === 'image' : visual.kind === 'video'))
    if (visual && !keepVisual) { drop(visual.url); setVisual(null); setVPeaks(null) }
    const keepAudio = audio && needsAudio(next) && (next === 'voice' ? audio.kind === 'voice' : audio.kind === 'file')
    if (audio && !keepAudio) { drop(audio.url); setAudio(null) }
    setFx((f) => ({ ...f, volOrig: defaultOrigVolume(next) }))
    setModeState(next)
  }

  /** Copia el archivo a memoria: algunos selectores de Android devuelven una referencia que deja de poder leerse más tarde. */
  async function snapshot(f: File): Promise<File> {
    return new File([await f.arrayBuffer()], f.name, { type: f.type, lastModified: f.lastModified })
  }

  async function pickVisual(file: File | undefined) {
    if (!file) return
    setMessage(null)
    setSaved(false)
    const wantVideo = mode !== 'imageAudio'
    const wantImage = mode === 'imageAudio' || mode === 'voice'
    const video = isVideoFile(file)
    const image = !video && isImageFile(file)
    if (video && !wantVideo) return fail('errImageType')
    if (image && !wantImage) return fail('errVideoType')
    if (!video && !image) return fail(mode === 'imageAudio' ? 'errImageType' : 'errVideoType')
    const cap = video ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > cap) return fail('errSize', { mb: mb(file.size), max: video ? LIMITS.maxVideoMB : LIMITS.maxImageMB })

    setReading(true)
    try {
      file = await snapshot(file)
    } catch {
      setReading(false)
      return fail(video ? 'errDecode' : 'errImageDecode')
    }
    const url = URL.createObjectURL(file)
    try {
      let width: number
      let height: number
      let duration = 0
      if (video) ({ width, height, duration } = await loadVideo(url))
      else {
        const img = await loadImage(url)
        width = img.naturalWidth
        height = img.naturalHeight
      }
      pb.pause()
      cache.current = null
      drop(visual?.url)
      setVisual({ kind: video ? 'video' : 'image', file, url, width, height, duration })
      setAspect('1:1')
      setCrop(fitCrop(width, height, 1, width / 2, height / 2))
      setVPeaks(null)
      if (video) {
        setVWin(initialWindow(duration, maxLen))
        void readAudio(file, 96).then((info) => setVPeaks((cur) => cur ?? info?.peaks ?? null))
      }
    } catch {
      drop(url)
      fail(video ? 'errDecode' : 'errImageDecode')
    } finally {
      setReading(false)
    }
  }

  async function pickAudio(file: File | undefined, kind: 'file' | 'voice') {
    if (!file) return
    setMessage(null)
    setSaved(false)
    if (kind === 'file' && !isAudioFile(file)) return fail('errAudioType')
    if (file.size > MAX_AUDIO_BYTES) return fail('errSize', { mb: mb(file.size), max: LIMITS.maxAudioMB })
    setReading(true)
    try {
      file = await snapshot(file)
      if (kind === 'voice') {
        const clean = await normalizeRecording(file)
        if (!clean) return fail('errVoiceSilent')
        file = clean
      }
      const info = await readAudio(file, 96)
      if (!info || !Number.isFinite(info.duration) || info.duration <= 0) return fail('errAudioDecode')
      pb.pause()
      cache.current = null
      drop(audio?.url)
      const len = hasVideo ? Math.min(vLen, maxLen) : maxLen
      setAudio({ kind, file, url: URL.createObjectURL(file), duration: info.duration, peaks: info.peaks })
      setAWin(initialWindow(info.duration, len))
    } catch {
      fail('errAudioDecode')
    } finally {
      setReading(false)
    }
  }

  function onFx(patch: Partial<Effects>) {
    touch()
    setFx((f) => ({ ...f, ...patch }))
    if (patch.speed !== undefined) {
      const limit = LIMITS.maxSeconds * patch.speed
      setVWin((w) => clampWindow(w, limit))
      setAWin((w) => clampWindow(w, limit))
    }
  }

  // Mientras se arrastra un recorte todo se pausa: el video muestra el cuadro del punto que se mueve
  // y el audio calla; al soltar, si estaba sonando, vuelve a empezar desde el inicio nuevo.
  const resume = useRef(false)
  const dragStart = () => {
    resume.current = pb.playing
    pb.pause()
  }
  const dragEnd = () => {
    if (resume.current) pb.restart()
    resume.current = false
  }
  const changeV = (start: number, end: number, kind: Handle) => {
    pb.seek('video', kind === 'end' ? Math.max(start, end - 0.05) : start)
    setVWin({ start, end })
    touch()
  }
  const changeA = (start: number, end: number, kind: Handle) => {
    pb.seek('audio', kind === 'end' ? Math.max(start, end - 0.05) : start)
    setAWin({ start, end })
    touch()
  }

  const box = boxFor(Math.max(1, crop.w), Math.max(1, crop.h), LIMITS.outputSize)
  const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio ?? null
  const pickAspect = (id: AspectId) => {
    if (!visual) return
    setAspect(id)
    const r = ASPECTS.find((a) => a.id === id)?.ratio
    if (r) setCrop((c) => fitCrop(visual.width, visual.height, r, c.x + c.w / 2, c.y + c.h / 2, Math.min(1, Math.max(0.3, Math.max(c.w / visual.width, c.h / visual.height)))))
    touch()
  }
  const canExport = !!visual && (!needsAudio(mode) || !!audio) && sourceLen > 0

  const keyOf = () => {
    if (!visual || !canExport) return ''
    const c = crop
    return [
      mode, visual.url, audio?.url ?? '', vWin.start.toFixed(2), vWin.end.toFixed(2), aWin.start.toFixed(2), aWin.end.toFixed(2),
      Math.round(c.x), Math.round(c.y), Math.round(c.w), Math.round(c.h), fx.speed, fx.fade, fx.volOrig, fx.volAdd, fx.text, fx.textPos, fx.textColor, fx.textSize, fx.bg,
    ].join('|')
  }

  /** Opciones de exportación; `wa` deja el sobrante transparente en vez de rellenarlo. */
  async function buildOpts(): Promise<ExportOptions | null> {
    if (!visual) return null
    // Medidas pares y siempre dentro del cuadro fuente (un píxel de más hace fallar a ffmpeg).
    const cw = Math.max(2, Math.min(visual.width, Math.floor(crop.w / 2) * 2))
    const ch = Math.max(2, Math.min(visual.height, Math.floor(crop.h / 2) * 2))
    const cr = { w: cw, h: ch, x: Math.max(0, Math.min(Math.round(crop.x), visual.width - cw)), y: Math.max(0, Math.min(Math.round(crop.y), visual.height - ch)) }
    let vis: ExportOptions['visual']
    if (visual.kind === 'video') vis = { kind: 'video', file: visual.file, start: vWin.start, crop: cr, whole: false, box, bg: fx.bg }
    else {
      const img = await loadImage(visual.url)
      vis = { kind: 'image', frame: await stickerFrameBlob(img, { crop: cr, whole: false, box, bg: fx.bg }) }
    }
    const text = textStyle ? await overlayBlob(textStyle) : null
    return {
      visual: vis,
      audio: audio ? { file: audio.file, start: aWin.start } : null,
      sourceLength: sourceLen,
      speed: fx.speed,
      fade: fx.fade,
      volOrig: fx.volOrig,
      volAdd: fx.volAdd,
      overlay: text,
      onProgress: setProgress,
    }
  }

  async function render(): Promise<Blob | null> {
    if (!visual || !canExport) return null
    const key = keyOf()
    if (cache.current?.key === key) return cache.current.blob
    pb.pause()
    setProgress(0)
    setPhase('loading')
    try {
      await loadFFmpeg()
      const opts = await buildOpts()
      if (!opts) return null
      setPhase('exporting')
      const blob = await exportSticker(opts)
      cache.current = { key, blob, saved: false }
      return blob
    } catch {
      fail('errExport')
      return null
    } finally {
      setPhase('idle')
    }
  }

  async function keep(blob: Blob) {
    if (cache.current && !cache.current.saved) {
      await saveSticker(blob, outLen)
      cache.current.saved = true
    }
    setSaved(true)
  }

  async function onSave() {
    setMessage(null)
    const blob = await render()
    if (!blob) return
    await keep(blob)
    download(blob)
    setMessage({ kind: 'info', text: t('saved', { mb: mb(blob.size) }) })
  }

  async function onShare() {
    setMessage(null)
    const blob = await render()
    if (!blob) return
    await keep(blob)
    const result = await shareFile(blob)
    if (result === 'unsupported') {
      download(blob)
      setMessage({ kind: 'info', text: t('shareFallback') })
    } else if (result === 'needs-tap') {
      setArmedKey(keyOf())
      setMessage({ kind: 'info', text: t('shareAgain') })
    } else setMessage({ kind: 'info', text: t('saved', { mb: mb(blob.size) }) })
  }

  const [linking, setLinking] = useState(false)

  /** Crea el sticker real (WebP + audio Opus con su hash) y lo envía al propio chat del usuario. */
  async function sendWa() {
    setMessage(null)
    try {
      const st = await waState()
      if (st.state !== 'linked') {
        setLinking(true)
        return
      }
      pb.pause()
      setProgress(0)
      setPhase('loading')
      await loadFFmpeg()
      const opts = await buildOpts()
      if (!opts) return
      setPhase('exporting')
      const r = await exportWaSticker(opts)
      // Antes de enviar, comprueba que el audio generado se pueda decodificar, dure lo esperado y no esté en silencio.
      const check = await analyzeAudio(r.opus)
      if (check && (check.duration < Math.min(r.seconds, outLen) * 0.6 || check.peak < 0.003)) throw new Error('BAD_AUDIO')
      const exif = buildExif(await sha256b64(r.opus))
      const webp = injectExif(r.webp, exif, r.seconds * 1000)
      setPhase('loading')
      await waSend(webp, r.opus, r.seconds)
      setMessage({ kind: 'info', text: t('waSent') })
    } catch (e) {
      const key = waErrorKey(e)
      console.error('wa-send', e)
      const detail = String((e as { message?: string })?.message ?? e).slice(0, 80)
      setMessage({ kind: 'error', text: key === 'waErrGeneric' ? `${t(key as Key)} (${detail})` : t(key as Key) })
    } finally {
      setPhase('idle')
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (isAudioFile(file) && !isVideoFile(file) && mode !== 'video' && mode !== 'voice') void pickAudio(file, 'file')
    else void pickVisual(file)
  }

  const busy = phase !== 'idle'
  const ready = canExport && armedKey !== '' && armedKey === keyOf()
  const tags = visual ? { tl: `${fmt(outLen)} / ${LIMITS.maxSeconds} s${fx.speed !== 1 ? ` ${fx.speed}x` : ''}`, tr: `${aspect === 'free' ? t('aspFree') : aspect} · ${LIMITS.outputSize}` } : { tl: '', tr: '' }
  const visAccept = mode === 'video' || mode === 'videoAudio' ? 'video/*' : mode === 'imageAudio' ? 'image/png,image/jpeg,image/webp' : 'image/png,image/jpeg,image/webp,video/*'
  const pickTitle: Key = mode === 'imageAudio' ? 'pickImage' : mode === 'voice' ? 'pickVisualVoice' : 'pickVideo'
  const pickHint = mode === 'imageAudio' ? t('pickHintImage', { mb: LIMITS.maxImageMB }) : mode === 'voice' ? t('pickHintVoice') : t('pickHintVideo', { mb: LIMITS.maxVideoMB, s: LIMITS.maxSeconds })
  const addedLabel: Key = mode === 'voice' ? 'volVoice' : mode === 'imageAudio' ? 'volAudio' : 'volAdded'
  const showOrig = mode === 'video' || mode === 'videoAudio' || (mode === 'voice' && hasVideo)

  return (
    <section className="editor" onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={onDrop}>
      <input ref={visInput} type="file" accept={visAccept} hidden onChange={(e) => { void pickVisual(e.target.files?.[0]); e.target.value = '' }} />
      <input ref={audInput} type="file" accept="audio/*" hidden onChange={(e) => { void pickAudio(e.target.files?.[0], 'file'); e.target.value = '' }} />

      <div className="sources" role="group">
        {MODES.map((m) => (
          <button key={m.id} type="button" className={mode === m.id ? 'on' : ''} aria-pressed={mode === m.id} aria-label={t(m.label)} onClick={() => setMode(m.id)}>
            <ModeIcon mode={m.id} />
            <span>{t(m.short)}</span>
          </button>
        ))}
      </div>

      {!visual ? (
        <button type="button" className={`stage pick${over ? ' over' : ''}`} aria-busy={reading} disabled={reading} onClick={() => visInput.current?.click()}>
          <span className="tag tl">{t('noSignal')}</span>
          <span className="plate">
            <strong>{reading ? t('loadingFile') : t(pickTitle)}</strong>
            {!reading && <small>{pickHint}</small>}
          </span>
        </button>
      ) : (
        <Preview
          kind={visual.kind}
          url={visual.url}
          width={visual.width}
          height={visual.height}
          crop={crop}
          onCrop={(c) => { setCrop(c); touch() }}
          ratio={ratio}
          videoRef={videoRef}
          playing={pb.playing}
          canPlay={hasVideo || !!audio}
          onTogglePlay={pb.toggle}
          tags={tags}
          overlay={overlay}
        />
      )}
      {audio && <audio ref={audioRef} src={audio.url} preload="auto" />}

      {visual && (
        <div className="chips shapes-row" role="group" aria-label={t('shapeLabel')}>
          {ASPECTS.map((a) => (
            <button key={a.id} type="button" className="chip" aria-pressed={aspect === a.id} onClick={() => pickAspect(a.id)}>{a.id === 'free' ? t('aspFree') : a.id}</button>
          ))}
        </div>
      )}

      {hasVideo && visual && (
        <div className="trim-block">
          <Trim label={t('trimVideo')} duration={visual.duration} start={vWin.start} end={vWin.end} time={pb.timeV} maxLen={maxLen} peaks={vPeaks} thumbs={thumbs} onChange={changeV} onDragStart={dragStart} onDragEnd={dragEnd} />
        </div>
      )}

      {needsAudio(mode) && (
        <div className="audio-block">
          {mode === 'voice' ? (
            <VoiceRecorder hasRecording={!!audio} disabled={reading} onFile={(f) => void pickAudio(f, 'voice')} onError={() => fail('errMic')} />
          ) : (
            !audio && (
              <button type="button" className="audio-pick" disabled={reading} onClick={() => audInput.current?.click()}>
                <i className="plus" aria-hidden="true" />
                <span>{t('pickAudio')}</span>
                <small>{t('pickAudioHint', { mb: LIMITS.maxAudioMB, s: LIMITS.maxSeconds })}</small>
              </button>
            )
          )}
          {audio && (
            <div className="trim-block">
              <Trim label={t('trimAudio')} accent="cyan" duration={audio.duration} start={aWin.start} end={aWin.end} time={pb.timeA} maxLen={maxLen} peaks={audio.peaks} onChange={changeA} onDragStart={dragStart} onDragEnd={dragEnd} />
              {audio.kind === 'file' && <button type="button" className="change" onClick={() => audInput.current?.click()}>{t('changeAudio')}</button>}
            </div>
          )}
        </div>
      )}

      {visual && <Tools onHelp={onHelp} fx={fx} onFx={onFx} showOrig={showOrig} showAdded={needsAudio(mode)} addedLabel={addedLabel} outLen={outLen} />}
      {visual && <button type="button" className="change" onClick={() => visInput.current?.click()}>{t('changeVisual')}</button>}
      {linking && <WaLink onClose={() => setLinking(false)} onLinked={() => { setLinking(false); void sendWa() }} />}

      <div className="status" role="status" aria-live="polite">
        {busy && (
          <p className="progress" style={{ ['--p' as string]: phase === 'exporting' ? progress : 0 }}>
            <span>{phase === 'loading' ? t('loadingEngine') : t('exporting', { p: Math.round(progress * 100) })}</span>
          </p>
        )}
        {!busy && message && <p className={message.kind}>{message.text}</p>}
        {!busy && !message && visual && needsAudio(mode) && !audio && <p className="info">{t('needAudio')}</p>}
        {!busy && saved && message?.kind === 'info' && <button type="button" className="next" onClick={onHelp}>{t('savedNext')}</button>}
      </div>

      <div className="dock two">
        <button type="button" className="back" disabled={!canExport || busy} onClick={onSave}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          {t('dSave')}
        </button>
        {waAvailable() ? (
          <button type="button" className="pri" disabled={!canExport || busy} onClick={sendWa}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8 14 2 10.5 14 8 9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            {t('dWa')}
          </button>
        ) : (
          <button type="button" className={`pri${ready ? ' ready' : ''}`} disabled={!canExport || busy} onClick={onShare}>{ready ? t('shareNow') : t('dShare')}</button>
        )}
      </div>
    </section>
  )
}
