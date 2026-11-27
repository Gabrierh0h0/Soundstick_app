import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { useT } from '../lib/i18n'
import { LIMITS } from '../lib/limits'
import { fmt, moveWindow, type Handle } from '../lib/trim'

type Props = {
  /** Texto accesible y rótulo visible de la pista ("video" o "audio"). */
  label: string
  duration: number
  start: number
  end: number
  /** Segundo actual de reproducción, para la línea de avance. */
  time: number
  /** Largo máximo de la ventana, en segundos del material fuente. */
  maxLen: number
  peaks: number[] | null
  accent?: 'lime' | 'cyan'
  /** `kind` indica qué se está moviendo, para mostrar el cuadro de ese punto. */
  onChange: (start: number, end: number, kind: Handle) => void
  /** Se llama al empezar y al terminar de arrastrar, para pausar y reanudar la reproducción. */
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function Trim({ label, duration, start, end, time, maxLen, peaks, accent = 'lime', onChange, onDragStart, onDragEnd }: Props) {
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
  const lit = Math.max(1, Math.min(10, Math.round(((end - start) / maxLen) * 10)))
  const bars = peaks ?? Array.from({ length: 64 }, () => 0.12)
  // Regla de segundos, con a lo sumo ~8 marcas para que no se amontonen.
  const step = Math.max(1, Math.ceil(duration / 8))
  const marks = Array.from({ length: Math.floor(duration / step) + 1 }, (_, i) => i * step).filter((m) => m < duration)

  return (
    <div className={`trim ${accent}`}>
      <span className="trim-label">{label}</span>
      <div className="ed">
      <div className="ruler" aria-hidden="true">
        {marks.map((m) => <s key={m} style={{ left: pct(m) }}>{m}s</s>)}
      </div>
      <div className="trim-track" ref={track} role="group" aria-label={peaks ? label : `${label} · ${t('noWave')}`}>
        <div className="sel-bg" style={{ left: pct(start), width: `${((end - start) / duration) * 100}%` }} aria-hidden="true" />
        <div className="wave" aria-hidden="true">
          {bars.map((h, i) => {
            const at = ((i + 0.5) / bars.length) * duration
            return <i key={i} className={at >= start && at <= end ? 'on' : ''} style={{ height: `${h * 100}%` }} />
          })}
        </div>
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
          className="handle"
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
          className="handle"
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
      <div className="cells">
        <span className="stp">
          <button type="button" aria-label={`${t('trimFrom')} −0,1 s`} onClick={() => apply('start', { start, end }, -0.1)}>−</button>
          <em><b>{t('trimFrom')}</b>{fmt(start)} s</em>
          <button type="button" aria-label={`${t('trimFrom')} +0,1 s`} onClick={() => apply('start', { start, end }, 0.1)}>+</button>
        </span>
        <span className="stp">
          <button type="button" aria-label={`${t('trimTo')} −0,1 s`} onClick={() => apply('end', { start, end }, -0.1)}>−</button>
          <em><b>{t('trimTo')}</b>{fmt(end)} s</em>
          <button type="button" aria-label={`${t('trimTo')} +0,1 s`} onClick={() => apply('end', { start, end }, 0.1)}>+</button>
        </span>
        <span className="span">
          <b>{t('trimSpan')}</b>
          <span className="pips" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < lit ? 'l' : ''} />)}
          </span>
          <em>{fmt(end - start)} / {fmt(maxLen)} s</em>
        </span>
      </div>
      </div>
    </div>
  )
}
