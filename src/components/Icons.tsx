/** Degradados compartidos por los íconos; se monta una sola vez en la app. */
export function IconDefs() {
  const grad = (id: string, a: string, b: string, c: string) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset=".5" stopColor={b} />
      <stop offset="1" stopColor={c} />
    </linearGradient>
  )
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {grad('ss-b', '#9ad0ff', '#2f7be0', '#1a3fa8')}
        {grad('ss-y', '#fff59a', '#ffd200', '#e08a00')}
        {grad('ss-p', '#ffc2ee', '#e83ac8', '#9a1a9c')}
        {grad('ss-g', '#b8ffc8', '#2ec45a', '#0d7a30')}
        {grad('ss-s', '#ffffff', '#dcdcec', '#b8b8d0')}
      </defs>
    </svg>
  )
}

export function ModeIcon({ mode }: { mode: 'video' | 'videoAudio' | 'imageAudio' | 'voice' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {mode === 'video' && (
        <>
          <rect x="2.5" y="6" width="13" height="12" rx="2" />
          <path d="M15.5 10.5 21.5 7v10l-6-3.5z" />
        </>
      )}
      {mode === 'videoAudio' && (
        <>
          <rect x="2.5" y="4" width="13" height="10" rx="2" />
          <path d="M15.5 7.5 21 5v8l-5.5-2.5z" />
          <path d="M4 18v2M7 17v4M10 18.5v1M13 16.5v5M16 18v2" />
        </>
      )}
      {mode === 'imageAudio' && (
        <>
          <rect x="2.5" y="3.5" width="19" height="12" rx="2" />
          <path d="m3 13 5-4.5 4 3.5 3-2.5 6 4" />
          <circle cx="16.5" cy="7.5" r="1.3" />
          <path d="M4 19v2M7 18v4M10 19.5v1M13 17.5v5M16 19v2" />
        </>
      )}
      {mode === 'voice' && (
        <>
          <rect x="9" y="2.5" width="6" height="12" rx="3" />
          <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7" />
        </>
      )}
    </svg>
  )
}

export function Heart() {
  return (
    <svg viewBox="0 0 12 11" aria-hidden="true" focusable="false">
      <path d="M6 10.5 L1 5.5 C-.5 3.5 1 .5 3.5 .8 C4.8 1 5.6 2 6 2.8 C6.4 2 7.2 1 8.5 .8 C11 .5 12.5 3.5 11 5.5 Z" fill="#fff" stroke="#8a0050" strokeWidth=".8" />
    </svg>
  )
}

export function Planet() {
  return (
    <svg viewBox="0 0 26 16" aria-hidden="true" focusable="false">
      <ellipse cx="13" cy="9" rx="12" ry="3.5" fill="none" stroke="#c9b6ff" strokeWidth="2" />
      <circle cx="13" cy="8" r="6" fill="#e9dcff" />
    </svg>
  )
}
