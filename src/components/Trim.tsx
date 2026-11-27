import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useT } from '../lib/i18n'
import { LIMITS } from '../lib/limits'
import { fmt, moveWindow, type Handle } from '../lib/trim'

type Props = {
  /** Texto accesible de la pista ("video" o "audio"). */
  label: string
  duration: number
  start: number
  end: number
  /** Segundo actual de reproducción, para la línea de avance. */
  time: number
  /** Largo máximo de la ventana, en segundos del material fuente. */
  maxLen: number
  peaks: number[] | null
  /** Cuadros del video como tira de miniaturas; sin ellos se dibuja la onda. */
  thumbs?: string[] | null
  accent?: 'lime' | 'cyan'
  /** `kind` indica qué se está moviendo, para mostrar el cuadro de ese punto. */
  onChange: (start: number, end: number, kind: Handle) => void
  /** Se llama al empezar y al terminar de arrastrar, para pausar y reanudar la reproducción. */
  onDragStart?: () => void
  onDragEnd?: () => void
}

/** Línea de tiempo de recorte: tira de cuadros (o onda) con una ventana de asas a los lados. */
export function Trim({ label, duration, start, end, time, maxLen, peaks, thumbs, accent = 'lime', onChange, onDragStart, onDragEnd }: Props) {
  const { t } = useT()
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef<{ kind: Handle; x0: number; start: number; end: number } | null>(null)

  const apply = (kind: Handle, base: { start: number; end: number }, delta: number) => {
    const next = moveWindow(kind, base, delta, duration, LIMITS.minSeconds, maxLen)
    onChange(next.start, next.end, kind)
  }

  const down = (kind: Handle) => (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { kind, x0: e.clientX, start, end }
    onDragStart?.()
  }
  const move = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current
    const width = track.current?.clientWidth
    if (!d || !width) return
    apply(d.kind, d, ((e.clientX - d.x0) / width) * duration)
  }
  const up = () => {
    if (!drag.current) return
    drag.current = null
    onDragEnd?.()
  }
  const key = (kind: Handle) => (e: KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 1 : 0.1
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') apply(kind, { start, end }, -step)
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') apply(kind, { start, end }, step)
    else return
    e.preventDefault()
  }

  const pct = (s: number) => `${(s / duration) * 100}%`
  const N = 56
  const src = peaks ?? Array.from({ length: N }, () => 0.12)
  const bars = Array.from({ length: N }, (_, i) => {
    const a = Math.floor((i * src.length) / N)
    const b = Math.max(a + 1, Math.floor(((i + 1) * src.length) / N))
    return Math.max(0.1, ...src.slice(a, b))
  })
  const pics = !!thumbs?.length

  return (
    <div className={`trim ${accent}`}>
      <div className="strip" ref={track} role="group" aria-label={peaks || pics ? label : `${label} · ${t('noWave')}`}>
        <div className={`frames ${pics ? 'pics' : 'wavy'}`} aria-hidden="true">
          {pics
            ? thumbs!.map((s, i) => <img key={i} src={s} alt="" draggable={false} />)
            : bars.map((h, i) => <i key={i} style={{ height: `${h * 100}%` }} />)}
        </div>
        <div className="dim" style={{ left: 0, width: pct(start) }} aria-hidden="true" />
        <div className="dim" style={{ left: pct(end), right: 0 }} aria-hidden="true" />
        <div
          className="trim-window"
          style={{ left: pct(start), width: `${((end - start) / duration) * 100}%` }}
          onPointerDown={down('move')}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
        <i className="playhead" style={{ left: pct(Math.min(Math.max(time, start), end)) }} aria-hidden="true" />
        <button
          type="button"
          className="handle start"
          style={{ left: pct(start) }}
          role="slider"
          aria-label={`${label} · ${t('trimFrom')}`}
          aria-valuemin={0}
          aria-valuemax={Math.max(0, end - LIMITS.minSeconds)}
          aria-valuenow={Number(start.toFixed(1))}
          onPointerDown={down('start')}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={key('start')}
        />
        <button
          type="button"
          className="handle end"
          style={{ left: pct(end) }}
          role="slider"
          aria-label={`${label} · ${t('trimTo')}`}
          aria-valuemin={start + LIMITS.minSeconds}
          aria-valuemax={duration}
          aria-valuenow={Number(end.toFixed(1))}
          onPointerDown={down('end')}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={key('end')}
        />
      </div>
      <div className="tlabels">
        <span>{fmt(start)}</span>
        <b>{t('cutLabel')} {fmt(end - start)} s</b>
        <span>{fmt(end)}</span>
      </div>
    </div>
  )
}
