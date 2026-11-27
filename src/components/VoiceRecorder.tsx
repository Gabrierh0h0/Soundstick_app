import { useEffect, useRef, useState } from 'react'
import { useT } from '../lib/i18n'
import { LIMITS } from '../lib/limits'
import { startRecording, type Recording } from '../lib/recorder'

type Props = {
  hasRecording: boolean
  disabled?: boolean
  onFile: (file: File) => void
  onError: () => void
}

export function VoiceRecorder({ hasRecording, disabled, onFile, onError }: Props) {
  const { t } = useT()
  const [seconds, setSeconds] = useState<number | null>(null)
  const rec = useRef<Recording | null>(null)

  // Si se sale de la pantalla grabando, se corta el micrófono.
  useEffect(() => () => void rec.current?.stop().catch(() => {}), [])

  async function start() {
    try {
      setSeconds(0)
      rec.current = await startRecording(LIMITS.maxSeconds, setSeconds, (file) => {
        rec.current = null
        setSeconds(null)
        onFile(file)
      })
    } catch {
      setSeconds(null)
      onError()
    }
  }

  async function stop() {
    const r = rec.current
    rec.current = null
    setSeconds(null)
    if (r) onFile(await r.stop())
  }

  if (seconds !== null) {
    return (
      <button type="button" className="rec live" onClick={stop}>
        <i className="dot" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg></i>
        <span role="timer">{t('recording', { s: seconds.toFixed(1) })}</span>
        <small>{t('stopRec')}</small>
        <b className="eq" aria-hidden="true"><i /><i /><i /><i /><i /></b>
      </button>
    )
  }
  return (
    <button type="button" className="rec" onClick={start} disabled={disabled}>
      <i className="dot" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg></i>
      <span>{hasRecording ? t('rerecord') : t('record')}</span>
      {!hasRecording && <small>{t('recordHint', { s: LIMITS.maxSeconds })}</small>}
    </button>
  )
}
