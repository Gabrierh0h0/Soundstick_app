import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import { useT } from '../lib/i18n'
import type { Crop } from '../lib/ffmpeg'
import { clamp } from '../lib/trim'

export type Framing = { cx: number; cy: number; zoom: number }

/** Tamaño del recorte para una forma de proporción `ar` (ancho/alto): el rectángulo más grande que cabe, dividido por el zoom. */
export function cropSize(w: number, h: number, ar: number, zoom: number) {
  const cw = (w / h > ar ? h * ar : w) / zoom
  return { cw, ch: cw / ar }
}

export function clampFraming(f: Framing, w: number, h: number, ar = 1): Framing {
  const { cw, ch } = cropSize(w, h, ar, f.zoom)
  return { zoom: f.zoom, cx: clamp(f.cx, cw / 2, w - cw / 2), cy: clamp(f.cy, ch / 2, h - ch / 2) }
}

export function framingToCrop(f: Framing, w: number, h: number, ar = 1): Crop {
  const { cw, ch } = cropSize(w, h, ar, f.zoom)
  return { w: cw, h: ch, x: clamp(f.cx - cw / 2, 0, w - cw), y: clamp(f.cy - ch / 2, 0, h - ch) }
}

type Props = {
  kind: 'video' | 'image'
  url: string
  width: number
  height: number
  framing: Framing
  onFraming: (f: Framing) => void
  videoRef: RefObject<HTMLVideoElement | null>
  playing: boolean
  canPlay: boolean
  onTogglePlay: () => void
  /** Etiquetas flotantes: tiempo (arriba izquierda), tipo (arriba derecha) y medida (abajo izquierda). */
  tags: { tl: string; tr: string; bl: string }
  fit: 'fill' | 'whole'
  bg: string
  /** Caja de la forma dentro del lienzo de 512. */
  box: { w: number; h: number }
  /** Texto superpuesto (PNG transparente) para ver cómo quedará. */
  overlay: string | null
}

export function Preview({ kind, url, width, height, framing, onFraming, videoRef, playing, canPlay, onTogglePlay, tags, overlay, fit, bg, box }: Props) {
  const { t } = useT()
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(354)
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize(el.clientWidth))
    ro.observe(el)
    setSize(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // La caja de la forma dentro del escenario cuadrado; fuera de ella el sticker queda transparente.
  const bw = (box.w / 512) * size
  const bh = (box.h / 512) * size
  const ar = box.w / box.h
  const { cw } = cropSize(width, height, ar, framing.zoom)
  const scale = bw / cw
  const style = {
    width: width * scale,
    height: height * scale,
    left: bw / 2 - framing.cx * scale,
    top: bh / 2 - framing.cy * scale,
  }

  const whole = fit === 'whole'
  const place = (s: number, bwid: number, bhei: number) => ({ width: width * s, height: height * s, left: (bwid - width * s) / 2, top: (bhei - height * s) / 2 })
  const mainStyle = whole ? place(Math.min(bw / width, bh / height), bw, bh) : style
  const blurStyle = { ...place(size / Math.min(width, height), size, size), filter: 'blur(14px)', transform: 'scale(1.15)' }
  const boxStyle = { left: (size - bw) / 2, top: (size - bh) / 2, width: bw, height: bh }
  const bgVideo = useRef<HTMLVideoElement>(null)

  // El fondo borroso de un video es una copia muda que sigue al video principal.
  const wantBlur = bg === 'blur'
  useEffect(() => {
    if (!wantBlur || kind !== 'video') return
    let raf = 0
    const tick = () => {
      const m = videoRef.current
      const b = bgVideo.current
      if (m && b) {
        if (Math.abs(b.currentTime - m.currentTime) > 0.12) b.currentTime = m.currentTime
        if (m.paused !== b.paused) void (m.paused ? b.pause() : b.play().catch(() => {}))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [wantBlur, kind, videoRef])

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (whole) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, cx: framing.cx, cy: framing.cy }
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    onFraming(clampFraming({ zoom: framing.zoom, cx: d.cx - (e.clientX - d.x) / scale, cy: d.cy - (e.clientY - d.y) / scale }, width, height, ar))
  }
  const up = () => {
    drag.current = null
  }

  return (
    <div className="stage" ref={boxRef} style={bg !== 'transparent' && bg !== 'blur' ? { background: bg } : undefined}>
      {wantBlur && (kind === 'video' ? <video ref={bgVideo} src={url} muted playsInline preload="auto" style={blurStyle} aria-hidden="true" /> : <img src={url} alt="" draggable={false} style={blurStyle} />)}
      <div className={`stage-pan${whole ? ' still' : ''}`} style={boxStyle} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} title={t('framingHint')}>
        {kind === 'video' ? (
          <video ref={videoRef} src={url} playsInline preload="auto" style={mainStyle} />
        ) : (
          <img src={url} alt="" draggable={false} style={mainStyle} />
        )}
      </div>
      {overlay && <img className="stage-overlay" src={overlay} alt="" draggable={false} />}
      <span className="tag tl">{tags.tl}</span>
      <span className="tag tr">{tags.tr}</span>
      {tags.bl && <span className="tag bl">{tags.bl}</span>}
      <button type="button" className="play" onClick={onTogglePlay} disabled={!canPlay} aria-label={playing ? t('pause') : t('play')}>
        <i className={playing ? 'pause' : 'tri'} />
      </button>
    </div>
  )
}
