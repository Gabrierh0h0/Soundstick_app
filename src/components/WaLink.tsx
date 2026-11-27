import { useEffect, useState } from 'react'
import { useT, type Key } from '../lib/i18n'
import { waErrorKey, waKeepAlive, waPair, waState, waUnlink } from '../lib/wa'

const CC: Record<string, string> = { CO: '57', MX: '52', AR: '54', ES: '34', US: '1', CA: '1', PE: '51', CL: '56', EC: '593', VE: '58', BR: '55', BO: '591', UY: '598', PY: '595', CR: '506', PA: '507', GT: '502', DO: '1', GB: '44', FR: '33', DE: '49', IT: '39', PT: '351' }
const guessCountry = () => CC[(navigator.language.split('-')[1] ?? '').toUpperCase()] ?? ''

type Props = { onClose: () => void; onLinked: () => void }

/** Vincula la cuenta con el código de emparejamiento de WhatsApp (sin QR, desde el mismo teléfono). */
export function WaLink({ onClose, onLinked }: Props) {
  const { t } = useT()
  const [cc, setCc] = useState(guessCountry)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [linked, setLinked] = useState(false)

  useEffect(() => {
    waState().then((s) => setLinked(s.state === 'linked')).catch(() => {})
  }, [])

  // Mientras se muestra el código, revisa cada 2 s si ya quedó vinculado.
  useEffect(() => {
    if (!code) return
    const id = setInterval(() => {
      waState().then((s) => { if (s.state === 'linked') { clearInterval(id); void waKeepAlive(false); onLinked() } }).catch(() => {})
    }, 2000)
    return () => clearInterval(id)
  }, [code, onLinked])

  async function ask() {
    setBusy(true)
    setError('')
    try {
      await waKeepAlive(true)
      const r = await waPair(cc.replace(/\D/g, '') + phone.replace(/\D/g, '').replace(/^0+/, ''))
      setCode(r.code)
    } catch (e) {
      await waKeepAlive(false)
      setError(t(waErrorKey(e) as Key))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => () => { void waKeepAlive(false) }, [])

  async function unlink() {
    setBusy(true)
    await waUnlink().catch(() => {})
    setLinked(false)
    setCode('')
    setBusy(false)
  }

  const phoneOk = cc.replace(/\D/g, '').length >= 1 && phone.replace(/\D/g, '').length >= 6

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={t('waLinkTitle')}>
      <div className="modal-box">
        <h3>{t('waLinkTitle')}</h3>
        {linked ? (
          <>
            <p className="ok">{t('wlLinked')}</p>
            <div className="modal-actions">
              <button type="button" className="sec" disabled={busy} onClick={unlink}>{t('waUnlink')}</button>
              <button type="button" className="pri" onClick={onClose}>{t('waCancel')}</button>
            </div>
          </>
        ) : !code ? (
          <>
            <p className="stepname">{t('wlStep1')}</p>
            <div className="num-row">
              <label className="modal-field cc">
                <span>{t('waCountry')}</span>
                <input type="tel" inputMode="numeric" autoComplete="off" placeholder="57" value={cc} onChange={(e) => setCc(e.target.value)} />
              </label>
              <label className="modal-field">
                <span>{t('waPhone')}</span>
                <input type="tel" inputMode="numeric" autoComplete="off" placeholder={t('waPhoneHint')} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
            </div>
            <p className="callout">{t('wlWarn')}</p>
            {error && <p className="error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="sec" onClick={onClose}>{t('waCancel')}</button>
              <button type="button" className="pri" disabled={busy || !phoneOk} onClick={ask}>{busy ? t('waWorking') : t('waGetCode')}</button>
            </div>
          </>
        ) : (
          <>
            <p className="stepname">{t('wlStep2')}</p>
            <ol className="steps compact">
              {(['wlHow1', 'wlHow2', 'wlHow3', 'wlHow4'] as const).map((k, i) => (
                <li key={k}><b aria-hidden="true">{i + 1}</b><span>{t(k)}</span></li>
              ))}
            </ol>
            <p className="code-label">{t('wlHow5')}</p>
            <p className="pair-code" aria-live="polite">{code}</p>
            <p className="waiting">{t('waWaiting')}</p>
            <div className="modal-actions">
              <button type="button" className="sec" onClick={onClose}>{t('waCancel')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
