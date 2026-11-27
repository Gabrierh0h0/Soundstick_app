import { useEffect, useState } from 'react'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { APK_URL, APP_VERSION, checkUpdate, type Update } from './lib/update'
import { Editor } from './components/Editor'
import { Help } from './components/Help'
import { Library } from './components/Library'
import { IconDefs } from './components/Icons'
import { I18nProvider, useT } from './lib/i18n'

type View = 'create' | 'library' | 'help'

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
        <div className="tb">
          <span className="tb-name"><img src="/logo.svg" alt="" />soundstick</span>
          <span className="tb-btns">
            {view !== 'create' && <button type="button" className="help" aria-label={t('navCreate')} onClick={() => setView('create')}>&lsaquo;</button>}
            {view === 'create' && <button type="button" className="help" aria-label={t('navLibrary')} onClick={() => setView('library')}><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" /><rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" /></svg></button>}
            <button type="button" className="help" aria-label={t('navHelp')} aria-current={view === 'help' ? 'page' : undefined} onClick={() => setView('help')}>?</button>
          </span>
        </div>
        {update && (
          <div className="update" role="status">
            <span>{t('updAvail', { v: update.version })}</span>
            <button type="button" onClick={() => void Browser.open({ url: update.url })}>{t('updGet')}</button>
            <button type="button" onClick={() => setUpdate(null)}>{t('updLater')}</button>
          </div>
        )}
        <div className="body">
        {/* El editor sigue montado al cambiar de vista para no perder el trabajo en curso. */}
        <div hidden={view !== 'create'}><Editor onHelp={() => setView('help')} /></div>
        {view === 'library' && <Library />}
        {view === 'help' && (
          <>
            <span className="lang" role="group" aria-label="Idioma / Language">
              <button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>es</button>
              <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>en</button>
            </span>
            <Help />
          </>
        )}
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
