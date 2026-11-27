import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import { useT, type Key } from '../lib/i18n'
import { readAudio } from '../lib/audio'
import { exportSticker, exportWaSticker, loadFFmpeg, type ExportOptions } from '../lib/ffmpeg'
import { buildExif, injectExif, sha256b64 } from '../lib/wasticker'
import { waAvailable, waErrorKey, waSend, waState } from '../lib/wa'
import { WaLink } from './WaLink'
import { LIMITS, MAX_AUDIO_BYTES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '../lib/limits'
import { saveSticker } from '../lib/library'
import { overlayBlob, overlayDataUrl, stickerFrameBlob } from '../lib/overlay'
import { DEFAULT_FX, SHAPES, boxOf, defaultOrigVolume, needsAudio, type AudioClip, type Effects, type Mode, type Visual } from '../lib/project'
import { download, shareFile } from '../lib/share'
import { clampWindow, fmt, initialWindow, type Handle } from '../lib/trim'
import { usePlayback } from '../hooks/usePlayback'
import { clampFraming, framingToCrop, Preview, type Framing } from './Preview'
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

const STEPS = ['stepPick', 'stepAdjust', 'stepSend'] as const
const MODES: { id: Mode; label: Key }[] = [
  { id: 'video', label: 'srcVideo' },
  { id: 'videoAudio', label: 'srcVideoAudio' },
  { id: 'imageAudio', label: 'srcImageAudio' },
  { id: 'voice', label: 'srcVoice' },
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
  const [framing, setFraming] = useState<Framing>({ cx: 0, cy: 0, zoom: 1 })
  const [fx, setFx] = useState<Effects>(DEFAULT_FX)
  const [phase, setPhase] = useState<Phase>('idle')
  const [reading, setReading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<Message>(null)
  const [saved, setSaved] = useState(false)
  const [over, setOver] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
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

    const url = URL.createObjectURL(file)
    setReading(true)
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
      setFraming({ cx: width / 2, cy: height / 2, zoom: 1 })
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
      const info = await readAudio(file, 96)
      if (!info || !Number.isFinite(info.duration) || info.duration <= 0) return fail('errAudioDecode')
      pb.pause()
      cache.current = null
      drop(audio?.url)
      const len = hasVideo ? Math.min(vLen, maxLen) : maxLen
      setAudio({ kind, file, url: URL.createObjectURL(file), duration: info.duration, peaks: info.peaks })
      setAWin(initialWindow(info.duration, len))
    } finally {
      setReading(false)
    }
  }

  function onFx(patch: Partial<Effects>) {
    touch()
    setFx((f) => ({ ...f, ...patch }))
    if (patch.shape && visual) {
      const b = boxOf(patch.shape)
      setFraming((fr) => clampFraming(fr, visual.width, visual.height, b.w / b.h))
    }
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

  const box = boxOf(fx.shape)
  const ar = box.w / box.h
  const canExport = !!visual && (!needsAudio(mode) || !!audio) && sourceLen > 0

  const keyOf = () => {
    if (!visual || !canExport) return ''
    const c = framingToCrop(framing, visual.width, visual.height, ar)
    return [
      mode, visual.url, audio?.url ?? '', vWin.start.toFixed(2), vWin.end.toFixed(2), aWin.start.toFixed(2), aWin.end.toFixed(2),
      Math.round(c.x), Math.round(c.y), Math.round(c.w), Math.round(c.h), fx.speed, fx.fade, fx.volOrig, fx.volAdd, fx.text, fx.textPos, fx.textColor, fx.textSize, fx.fit, fx.bg, fx.shape,
    ].join('|')
  }

  /** Opciones de exportación; `wa` deja el sobrante transparente en vez de rellenarlo. */
  async function buildOpts(): Promise<ExportOptions | null> {
    if (!visual) return null
    const crop = framingToCrop(framing, visual.width, visual.height, ar)
    let vis: ExportOptions['visual']
    if (visual.kind === 'video') vis = { kind: 'video', file: visual.file, start: vWin.start, crop, whole: fx.fit === 'whole', box, bg: fx.bg }
    else {
      const img = await loadImage(visual.url)
      vis = { kind: 'image', frame: await stickerFrameBlob(img, { crop, whole: fx.fit === 'whole', box, bg: fx.bg }) }
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
  const cur = canExport ? step : 1
  const go = (n: number) => { pb.pause(); setMessage(null); setStep(n as 1 | 2 | 3) }
  const ready = canExport && armedKey !== '' && armedKey === keyOf()
  const tags = visual ? { tl: `${fmt(outLen)} s${fx.speed !== 1 ? ` ${fx.speed}x` : ''}`, tr: t(visual.kind === 'video' ? 'tagVideo' : 'tagImage'), bl: `${LIMITS.outputSize}x${LIMITS.outputSize}` } : { tl: '', tr: '', bl: '' }
  const visAccept = mode === 'video' || mode === 'videoAudio' ? 'video/*' : mode === 'imageAudio' ? 'image/png,image/jpeg,image/webp' : 'image/png,image/jpeg,image/webp,video/*'
  const pickTitle: Key = mode === 'imageAudio' ? 'pickImage' : mode === 'voice' ? 'pickVisualVoice' : 'pickVideo'
  const pickHint = mode === 'imageAudio' ? t('pickHintImage', { mb: LIMITS.maxImageMB }) : mode === 'voice' ? t('pickHintVoice') : t('pickHintVideo', { mb: LIMITS.maxVideoMB, s: LIMITS.maxSeconds })
  const addedLabel: Key = mode === 'voice' ? 'volVoice' : mode === 'imageAudio' ? 'volAudio' : 'volAdded'
  const showOrig = mode === 'video' || mode === 'videoAudio' || (mode === 'voice' && hasVideo)

  return (
    <section className="editor" onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={onDrop}>
      <input ref={visInput} type="file" accept={visAccept} hidden onChange={(e) => { void pickVisual(e.target.files?.[0]); e.target.value = '' }} />
      <input ref={audInput} type="file" accept="audio/*" hidden onChange={(e) => { void pickAudio(e.target.files?.[0], 'file'); e.target.value = '' }} />

      <ol className="stepbar" aria-label={t('stepsLabel')}>
        {STEPS.map((k, i) => (
          <li key={k} className={i + 1 <= cur ? 'd' : ''} aria-current={i + 1 === cur ? 'step' : undefined}>
            <i />
            {i + 1} {t(k)}
          </li>
        ))}
      </ol>
      <h2 className="step-title">{t(cur === 1 ? 'stepT1' : cur === 2 ? 'stepT2' : 'stepT3')}</h2>

      {cur === 1 && (
        <div className="sources" role="group">
          {MODES.map((m) => (
            <button key={m.id} type="button" className={mode === m.id ? 'on' : ''} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
              <ModeIcon mode={m.id} />
              <span>{t(m.label)}</span>
            </button>
          ))}
        </div>
      )}

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
          framing={framing}
          onFraming={(f) => { setFraming(f); touch() }}
          videoRef={videoRef}
          playing={pb.playing}
          canPlay={hasVideo || !!audio}
          onTogglePlay={pb.toggle}
          tags={tags}
          fit={fx.fit}
          bg={fx.bg}
          box={box}
          overlay={overlay}
        />
      )}
      {audio && <audio ref={audioRef} src={audio.url} preload="auto" />}

      {cur === 1 && visual && (
        <p className="readout">
          {visual.file.name}
          {hasVideo && <>, {t('fileSize', { mb: mb(visual.file.size), max: LIMITS.maxVideoMB })}</>}
          <button type="button" className="change" onClick={() => visInput.current?.click()}>{t('changeVisual')}</button>
        </p>
      )}

      {cur === 1 && needsAudio(mode) && (
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
          {audio && mode !== 'voice' && (
            <p className="readout">
              {audio.file.name}
              <button type="button" className="change" onClick={() => audInput.current?.click()}>{t('changeAudio')}</button>
            </p>
          )}
        </div>
      )}

      {cur === 2 && visual && (
        <>
          {fx.fit === 'fill' && (
            <label className="zoom">
              <span>{t('zoom')}</span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={framing.zoom}
                onChange={(e) => { setFraming(clampFraming({ ...framing, zoom: Number(e.target.value) }, visual.width, visual.height, ar)); touch() }}
              />
            </label>
          )}
          <div className="chips" role="group" aria-label={t('shapeLabel')}>
            {SHAPES.map((sh) => (
              <button key={sh.id} type="button" className="chip" aria-pressed={fx.shape === sh.id} onClick={() => onFx({ shape: sh.id })}>{sh.ratio}</button>
            ))}
          </div>
          {hasVideo && (
            <div className="trim-block">
              <Trim label={t('trimVideo')} duration={visual.duration} start={vWin.start} end={vWin.end} time={pb.timeV} maxLen={maxLen} peaks={vPeaks} onChange={changeV} onDragStart={dragStart} onDragEnd={dragEnd} />
            </div>
          )}
          {audio && (
            <div className="trim-block">
              <Trim label={t('trimAudio')} accent="cyan" duration={audio.duration} start={aWin.start} end={aWin.end} time={pb.timeA} maxLen={maxLen} peaks={audio.peaks} onChange={changeA} onDragStart={dragStart} onDragEnd={dragEnd} />
            </div>
          )}
          <Tools onHelp={onHelp} fx={fx} onFx={onFx} showOrig={showOrig} showAdded={needsAudio(mode)} addedLabel={addedLabel} outLen={outLen} />
        </>
      )}

      {cur === 3 && visual && (
        <div className="card">
          <div className="kv"><b>{t('sumShape')}</b><span>{box.ratio}</span></div>
          <div className="kv"><b>{t('sumLen')}</b><span>{fmt(outLen)} s</span></div>
          <div className="kv"><b>{t('sumFile')}</b><span>{visual.file.name}</span></div>
          <button type="button" className="chip save" disabled={!canExport || busy} onClick={onSave}>{t('save')}</button>
        </div>
      )}
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

      <div className="dock">
        {cur > 1 ? <button type="button" className="back" disabled={busy} onClick={() => go(cur - 1)}>{t('back')}</button> : <span />}
        {cur < 3 ? (
          <button type="button" className="pri" disabled={!canExport || busy} onClick={() => go(cur + 1)}>{t('next')}</button>
        ) : waAvailable() ? (
          <button type="button" className="pri" disabled={!canExport || busy} onClick={sendWa}>{t('waSend')}</button>
        ) : (
          <button type="button" className={`pri${ready ? ' ready' : ''}`} disabled={!canExport || busy} onClick={onShare}>{ready ? t('shareNow') : t('share')}</button>
        )}
      </div>
    </section>
  )
}
