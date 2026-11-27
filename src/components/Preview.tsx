import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'
import { useT } from '../lib/i18n'
import type { Crop } from '../lib/ffmpeg'
import { clamp } from '../lib/trim'

/** Lado mínimo del recuadro, como fracción del lado menor de la imagen. */
const MIN_FRAC = 0.08

/** El recuadro más grande de proporción `ratio` (ancho/alto) que cabe en la imagen, centrado en (cx, cy). */
export function fitCrop(w: number, h: number, ratio: number, cx: number, cy: number, scale = 1): Crop {
  const cw = (w / h > ratio ? h * ratio : w) * scale
  const ch = cw / ratio
  return { w: cw, h: ch, x: clamp(cx - cw / 2, 0, w - cw), y: clamp(cy - ch / 2, 0, h - ch) }
}

type Corner = 'nw' | 'ne' | 'sw' | 'se'
type Drag = { kind: 'move' | Corner; x0: number; y0: number; c: Crop }

type Props = {
  kind: 'video' | 'image'
  url: string
  width: number
  height: number
  /** Recuadro elegido, en píxeles de la imagen original. */
  crop: Crop
  onCrop: (c: Crop) => void
  /** Proporción fija (ancho/alto) o null para recorte libre. */
  ratio: number | null
  videoRef: RefObject<HTMLVideoElement | null>
  playing: boolean
  canPlay: boolean
  onTogglePlay: () => void
  /** Etiquetas flotantes: tiempo (arriba izquierda) y medida (arriba derecha). */
  tags: { tl: string; tr: string }
  /** Texto superpuesto (PNG transparente) para ver cómo quedará. */
  overlay: string | null
}

export function Preview({ kind, url, width, height, crop, onCrop, ratio, videoRef, playing, canPlay, onTogglePlay, tags, overlay }: Props) {
  const { t } = useT()
  const boxRef = useRef<HTMLDivElement>(null)
  const [dim, setDim] = useState({ w: 354, h: 354 })
  const drag = useRef<Drag | null>(null)
  const cropRef = useRef<HTMLDivElement>(null)
  // En pantalla táctil, el recuadro solo se mueve tras mantener el dedo un instante; antes de eso el dedo desplaza la página.
  const hold = useRef<{ timer: number; x: number; y: number } | null>(null)
  const [grab, setGrab] = useState(false)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDim({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setDim({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // La imagen completa cabe en el visor; el recuadro se dibuja encima.
  const s = Math.min(dim.w / width, dim.h / height)
  const ox = (dim.w - width * s) / 2
  const oy = (dim.h - height * s) / 2
  const mediaStyle = { width: width * s, height: height * s, left: ox, top: oy }
  const min = Math.max(16, Math.min(width, height) * MIN_FRAC)

  // Una vez que el recuadro está "agarrado", el navegador no debe tomar el gesto para desplazar la página.
  useEffect(() => {
    const el = cropRef.current
    if (!el) return
    const block = (e: TouchEvent) => {
      if (drag.current) e.preventDefault()
    }
    el.addEventListener('touchmove', block, { passive: false })
    return () => el.removeEventListener('touchmove', block)
  }, [])

  const down = (kindOf: Drag['kind']) => (e: PointerEvent<HTMLElement>) => {
    e.stopPropagation()
    if (kindOf === 'move' && e.pointerType === 'touch') {
      const x = e.clientX
      const y = e.clientY
      const c = crop
      hold.current = {
        x,
        y,
        timer: window.setTimeout(() => {
          const pend = hold.current
          if (!pend) return
          drag.current = { kind: 'move', x0: pend.x, y0: pend.y, c }
          setGrab(true)
          navigator.vibrate?.(12)
        }, 230),
      }
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { kind: kindOf, x0: e.clientX, y0: e.clientY, c: crop }
  }

  const move = (e: PointerEvent<HTMLElement>) => {
    const pend = hold.current
    if (pend && !drag.current) {
      // Si el dedo se mueve antes de agarrar el recuadro, es un desplazamiento de página.
      if (Math.hypot(e.clientX - pend.x, e.clientY - pend.y) > 8) {
        window.clearTimeout(pend.timer)
        hold.current = null
      } else {
        return
      }
    }
    const d = drag.current
    if (!d) return
    const dx = (e.clientX - d.x0) / s
    const dy = (e.clientY - d.y0) / s
    const c = d.c
    if (d.kind === 'move') {
      onCrop({ ...c, x: clamp(c.x + dx, 0, width - c.w), y: clamp(c.y + dy, 0, height - c.h) })
      return
    }
    const west = d.kind === 'nw' || d.kind === 'sw'
    const north = d.kind === 'nw' || d.kind === 'ne'
    const fx = west ? c.x + c.w : c.x // esquina opuesta, que no se mueve
    const fy = north ? c.y + c.h : c.y
    const px = clamp((west ? c.x : c.x + c.w) + dx, 0, width)
    const py = clamp((north ? c.y : c.y + c.h) + dy, 0, height)
    let w = Math.max(min, Math.abs(px - fx))
    let h = Math.max(min, Math.abs(py - fy))
    const availW = west ? fx : width - fx
    const availH = north ? fy : height - fy
    if (ratio) {
      w = Math.max(w, h * ratio)
      h = w / ratio
      const k = Math.min(1, availW / w, availH / h)
      w *= k
      h *= k
    } else {
      w = Math.min(w, availW)
      h = Math.min(h, availH)
    }
    onCrop({ w, h, x: west ? fx - w : fx, y: north ? fy - h : fy })
  }

  const up = () => {
    if (hold.current) window.clearTimeout(hold.current.timer)
    hold.current = null
    drag.current = null
    setGrab(false)
  }

  const handle = (corner: Corner) => (
    <span
      key={corner}
      className={`ch ${corner}`}
      onPointerDown={down(corner)}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    />
  )

  return (
    <div className="stage" ref={boxRef} style={{ aspectRatio: String(Math.min(1.6, Math.max(0.62, width / height))) }}>
      {kind === 'video' ? (
        <video ref={videoRef} src={url} playsInline preload="auto" style={mediaStyle} />
      ) : (
        <img src={url} alt="" draggable={false} style={mediaStyle} />
      )}
      <div
        className={`cropbox${grab ? ' grab' : ''}`}
        ref={cropRef}
        style={{ left: ox + crop.x * s, top: oy + crop.y * s, width: crop.w * s, height: crop.h * s }}
        onPointerDown={down('move')}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        title={t('framingHint')}
      >
        {overlay && <img className="stage-overlay" src={overlay} alt="" draggable={false} />}
        {(['nw', 'ne', 'sw', 'se'] as const).map(handle)}
      </div>
      <span className="tag tl">{tags.tl}</span>
      <span className="tag tr">{tags.tr}</span>
      <button type="button" className="play" onClick={onTogglePlay} disabled={!canPlay} aria-label={playing ? t('pause') : t('play')}>
        <i className={playing ? 'pause' : 'tri'} />
      </button>
    </div>
  )
}
