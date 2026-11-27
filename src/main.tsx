import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/vt323/latin-400.css'
import '@fontsource/silkscreen/latin-400.css'
import '@fontsource/silkscreen/latin-700.css'
import '@fontsource/special-elite/latin-400.css'
import '@fontsource/share-tech-mono/latin-400.css'
import '@fontsource/orbitron/latin-900.css'
import '@fontsource/rubik-glitch/latin-400.css'
import '@fontsource/oxanium/latin-400.css'
import '@fontsource/oxanium/latin-700.css'
import '@fontsource/archivo-black/latin-400.css'
import '@fontsource/monoton/latin-400.css'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Dentro de la app Android los archivos ya van empaquetados: sin service worker, siempre se ve la versión instalada.
if (Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then(async (regs) => {
    if (!regs.length) return
    await Promise.all(regs.map((r) => r.unregister()))
    await Promise.all((await caches.keys()).map((k) => caches.delete(k)))
    location.reload()
  })
}
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
