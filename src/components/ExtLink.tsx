import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import type { ReactNode } from 'react'

/** Enlace externo: en la app abre el navegador del sistema; en la web, una pestaña nueva. */
export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(e) => {
        if (Capacitor.isNativePlatform()) {
          e.preventDefault()
          void Browser.open({ url: href })
        }
      }}
    >
      {children}
    </a>
  )
}
