import { useT } from '../lib/i18n'
import { LIMITS } from '../lib/limits'

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="steps">
      {items.map((text, i) => (
        <li key={i}>
          <b aria-hidden="true">{i + 1}</b>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  )
}

export function Help() {
  const { t } = useT()
  return (
    <section className="help">
      <h2>{t('hCreate')}</h2>
      <Steps items={[t('hCreate1'), t('hCreate2'), t('hCreate3')]} />

      <h2>{t('hLink')}</h2>
      <Steps items={[t('hLink1'), t('hLink2'), t('hLink3'), t('hLink4')]} />
      <p className="callout">{t('hLinkNote')}</p>

      <h2>{t('hLimits')}</h2>
      <ul className="facts">
        <li>{t('hLimVideo', { mb: LIMITS.maxVideoMB })}</li>
        <li>{t('hLimAudio', { mb: LIMITS.maxAudioMB })}</li>
        <li>{t('hLimImage', { mb: LIMITS.maxImageMB })}</li>
        <li>{t('hLimLen', { s: LIMITS.maxSeconds })}</li>
      </ul>

      <h2>{t('hSafe')}</h2>
      <p>{t('hSafeText')}</p>

      <h2>{t('helpPrivacyTitle')}</h2>
      <p>{t('hPrivacy')}</p>
    </section>
  )
}
