import { useEffect, useState } from 'react'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { APK_URL, APP_VERSION, checkUpdate, type Update } from './lib/update'
import { Editor } from './components/Editor'
import { Help } from './components/Help'
import { Library } from './components/Library'
import { Heart, IconDefs } from './components/Icons'
import { I18nProvider, useT, type Key } from './lib/i18n'

type View = 'create' | 'library' | 'help'
const VIEWS: { id: View; label: Key }[] = [
  { id: 'create', label: 'navCreate' },
  { id: 'library', label: 'navLibrary' },
  { id: 'help', label: 'navHelp' },
]

function Shell() {
  const { t, lang, setLang } = useT()
  const [view, setView] = useState<View>('create')
  const [update, setUpdate] = useState<Update | null>(null)
  useEffect(() => { void checkUpdate().then(setUpdate) }, [])
  const native = Capacitor.isNativePlatform()

  return (
    <div className="app">
      <IconDefs />
      <div className="win">
        <div className="tb" aria-hidden="true">
          <span className="tb-name"><img src="/logo.svg" alt="" />soundstick</span>
          <span className="ctl"><i className="heart"><Heart /></i><i className="mn" /><i className="mx" /><i className="cl" /></span>
        </div>
        <header className="banner">
          <h1 className="logo" aria-label="soundstick">soundstick</h1>
        </header>
        {update && (
          <div className="update" role="status">
            <span>{t('updAvail', { v: update.version })}</span>
            <button type="button" onClick={() => void Browser.open({ url: update.url })}>{t('updGet')}</button>
            <button type="button" onClick={() => setUpdate(null)}>{t('updLater')}</button>
          </div>
        )}
        <div className="tick" aria-hidden="true"><span>{t('ticker')}</span></div>
        <nav className="pivot" aria-label="Secciones">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" aria-current={view === v.id ? 'page' : undefined} onClick={() => setView(v.id)}>
              {t(v.label)}
            </button>
          ))}
          <span className="lang" role="group" aria-label="Idioma / Language">
            <button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>es</button>
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>en</button>
          </span>
        </nav>
        <div className="body">
        {/* El editor sigue montado al cambiar de vista para no perder el trabajo en curso. */}
        <div hidden={view !== 'create'}><Editor onHelp={() => setView('help')} /></div>
        {view === 'library' && <Library />}
        {view === 'help' && <Help />}
        </div>
        {!native && (
          <div className="download">
            <a href={APK_URL} download>{t('dlAndroid')}</a>
            <small>{t('dlHint')}</small>
          </div>
        )}
        <footer className="statusbar"><span>{t('ready')}</span><span>soundstick {APP_VERSION}</span></footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  )
}
