/** Cuadros sueltos de un video (data URLs JPEG), para la línea de tiempo del recorte. */
export async function makeThumbs(url: string, duration: number, count = 10, height = 64): Promise<string[]> {
  const v = document.createElement('video')
  v.muted = true
  v.playsInline = true
  v.preload = 'auto'
  v.src = url
  await new Promise<void>((resolve, reject) => {
    v.onloadeddata = () => resolve()
    v.onerror = () => reject(new Error('thumbs'))
  })
  const w = Math.max(1, Math.round((height * v.videoWidth) / v.videoHeight))
  const canvas = Object.assign(document.createElement('canvas'), { width: w, height })
  const ctx = canvas.getContext('2d')!
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    v.currentTime = Math.min(duration - 0.05, ((i + 0.5) / count) * duration)
    await new Promise<void>((resolve) => {
      const done = () => { v.removeEventListener('seeked', done); resolve() }
      v.addEventListener('seeked', done)
      window.setTimeout(done, 2500)
    })
    ctx.drawImage(v, 0, 0, w, height)
    out.push(canvas.toDataURL('image/jpeg', 0.6))
  }
  v.removeAttribute('src')
  v.load()
  return out
}
