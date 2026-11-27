import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'es' | 'en'

export const dict = {
  es: {
    updAvail: 'hay una versión nueva ({v})', updGet: 'descargar', updLater: 'luego', dlAndroid: 'descargar para android', dlHint: 'App Android con envío directo a WhatsApp. Es un cliente no oficial: úsala con una cuenta que puedas arriesgar.',
    cutLabel: 'recorte', dSave: 'Guardar', dWa: 'Enviar a WhatsApp', dShare: 'Compartir',
    mVideo: 'Video', mVideoAudio: 'Video + audio', mImage: 'Imagen + audio', mVoice: 'Voz',
    stepsLabel: 'pasos', stepPick: 'Elegir', stepAdjust: 'Ajustar', stepSend: 'Enviar', stepT1: '¿Qué quieres usar?', stepT2: 'Ajusta tu sticker', stepT3: 'Listo para enviar', back: '‹ Atrás', next: 'Siguiente ›', sumShape: 'Forma', sumLen: 'Duración', sumFile: 'Archivo',
    noSignal: 'sin señal',
    navCreate: 'crear', navLibrary: 'biblioteca', navHelp: 'ayuda',
    srcVideo: 'video + sonido', srcVideoAudio: 'video + audio', srcImageAudio: 'imagen + audio', srcVoice: 'voz',
    pickVideo: 'elige un video', pickImage: 'elige una imagen', pickVisualVoice: 'elige imagen o video',
    pickHintVideo: 'hasta {mb} MB, se recorta a {s} s', pickHintImage: 'PNG, JPG o WEBP, hasta {mb} MB',
    pickHintVoice: 'lo que se verá mientras suena tu voz',
    pickAudio: 'elige un audio', pickAudioHint: 'MP3, M4A, WAV, hasta {mb} MB, se recorta a {s} s',
    changeAudio: 'otro audio', changeVisual: 'otro archivo',
    record: 'grabar voz', recordHint: 'hasta {s} s, pide permiso del micrófono', recording: 'grabando... {s} s', stopRec: 'detener', rerecord: 'grabar de nuevo',
    framingHint: 'arrastra para mover el encuadre', zoom: 'zoom',
    play: 'reproducir', pause: 'pausar',
    trimVideo: 'video', trimAudio: 'audio', trimFrom: 'inicio', trimTo: 'fin',
    trimLen: '{len} s de {max} s', fileSize: '{mb} de {max} MB', noWave: 'sin onda de audio', trimSpan: 'largo', tagVideo: 'video', tagImage: 'imagen', toolHelp: 'ayuda!!!!', ready: 'listo', ticker: 'hasta 10 segundos ... video 50 MB ... audio 10 MB ... imagen 5 MB ... sin cuentas, todo queda en tu telefono ...', ajustes: 'ajustes',
    save: 'guardar para sticker', share: 'enviar como video', shareNow: 'toca para enviar',
    loadingEngine: 'preparando el editor...', loadingFile: 'leyendo el archivo...', exporting: 'exportando {p}%',
    saved: 'listo, {mb} MB. Ahora en WhatsApp: teclado de stickers, crear, elige este video', savedNext: 'ver pasos en whatsapp',
    shareFallback: 'Este navegador no puede compartir archivos. Lo descargué para que lo envíes a mano.',
    shareAgain: 'Listo. Toca compartir otra vez para abrir WhatsApp.',
    needAudio: 'Falta el audio para poder guardar.',
    errVideoType: 'Ese archivo no es un video.', errImageType: 'Ese archivo no es una imagen (usa PNG, JPG o WEBP).', errAudioType: 'Ese archivo no es un audio.',
    errSize: 'Pesa {mb} MB; el máximo es {max} MB.',
    errDecode: 'Tu navegador no puede leer este video. Prueba con un MP4.', errImageDecode: 'No pude abrir esta imagen.',
    errVoiceSilent: 'No se escuchó nada en la grabación. Revisa que el micrófono funcione y vuelve a grabar.', waErrBadAudio: 'El audio del sticker salió vacío o cortado, así que no lo envié. Vuelve a intentarlo; si pasa de nuevo, graba otra vez.',
    errAudioDecode: 'No pude leer este audio. Prueba con MP3, M4A o WAV.',
    errMic: 'No pude usar el micrófono. Revisa el permiso del navegador.',
    errExport: 'No pude exportar este clip. Prueba con uno más corto.',
    toolVolume: 'volumen', toolSpeed: 'velocidad', toolFade: 'fundido', toolText: 'texto', toolFormat: 'formato', fitFill: 'llenar', fitWhole: 'completo', fitBg: 'fondo', bgBlur: 'borroso', colBlack: 'negro', shapeLabel: 'forma', bgClear: 'transparente', fitHint: 'La forma define las proporciones. Llenar recorta para cubrirla; Completo muestra todo. Lo que rodea queda transparente en WhatsApp (el MP4 no guarda transparencia y lo rellena de negro).',
    volOriginal: 'sonido del video', volAdded: 'audio añadido', volVoice: 'tu voz', volAudio: 'audio',
    fadeOff: 'ninguno', fadeHint: 'entra y sale suave', speedHint: 'el clip final dura {s} s',
    textPlaceholder: 'escribe algo o un emoji', textPos: 'posición', posTop: 'arriba', posCenter: 'centro', posBottom: 'abajo', textColor: 'color', textSize: 'tamaño',
    colWhite: 'blanco', colLime: 'lima', colCyan: 'cian', colMagenta: 'magenta', colYellow: 'amarillo',
    libEmpty: 'Aún no hay stickers. Los que guardes aparecen aquí, solo en este dispositivo.',
    libShare: 'compartir', libDownload: 'descargar', libDelete: 'borrar', libSure: '¿seguro?',
    hLegal: 'Legal', hLegalNote: 'Soundstick es software libre (GPL-3.0). No está afiliada a WhatsApp ni a Meta.',
    lgPrivacy: 'Política de Privacidad', lgTerms: 'Términos de Uso', lgDisclaimer: 'Aviso legal', lgData: 'Tratamiento de datos (Colombia)', lgUse: 'Uso aceptable', lgCopyright: 'Derechos de autor', lgThird: 'Licencias de terceros', lgSecurity: 'Seguridad', lgPerms: 'Permisos y almacenamiento',
    lgAgree1: 'Leí y acepto los', lgAgree2: 'y la',
    hCreate: 'Crear un sticker', hCreate1: 'Elige la modalidad (video, video + audio, imagen + audio o voz) y sube tu archivo.', hCreate2: 'Ajusta la forma, recorta hasta 10 segundos y cambia volumen, velocidad o fundido si quieres.', hCreate3: 'Toca Guardar para quedártelo, o Enviar a WhatsApp para recibirlo con sonido en tu chat.',
    hLink: 'Conectar WhatsApp', hLink1: 'Toca Enviar a WhatsApp. La primera vez te pide vincular tu cuenta.', hLink2: 'Escribe tu número con el código de tu país y toca Pedir código.', hLink3: 'En WhatsApp ve a Ajustes, Dispositivos vinculados, Vincular un dispositivo y elige Vincular con número de teléfono.', hLink4: 'Escribe el código que te muestra Soundstick. Solo se hace una vez.',
    hLinkNote: 'El sticker llega a tu chat contigo mismo (Tú). Desde ahí lo mantienes presionado y lo reenvías o lo guardas.',
    hLimits: 'Límites', hLimVideo: 'Video: hasta {mb} MB', hLimAudio: 'Audio: hasta {mb} MB', hLimImage: 'Imagen: hasta {mb} MB', hLimLen: 'Sticker final: hasta {s} segundos',
    hSafe: 'Cuida tu cuenta', hSafeText: 'Soundstick no es una app oficial de WhatsApp. Para reducir el riesgo solo envía a tu propio chat y limita los envíos. Úsala con calma y, si puedes, con un número secundario.',
    hPrivacy: 'Todo se procesa en tu teléfono. Soundstick no lee tus chats ni tus fotos y no sube tus archivos a ningún servidor.',
    wlWarn: 'Es un método no oficial: WhatsApp podría limitar la cuenta si se abusa. Usa pocas veces al día.', wlStep1: 'Paso 1 de 2 · Tu número', wlStep2: 'Paso 2 de 2 · Escribe el código en WhatsApp',
    wlHow1: 'Abre WhatsApp y ve a Ajustes', wlHow2: 'Toca Dispositivos vinculados', wlHow3: 'Vincular un dispositivo', wlHow4: 'Vincular con número de teléfono', wlHow5: 'Escribe este código:',
    wlLinked: 'Tu WhatsApp ya está vinculado. Ya puedes enviar stickers a tu chat.',
    helpTitle: 'cómo llega a whatsapp',
    helpStep1: 'Crea y guarda tu sticker aquí: sale un MP4 cuadrado de 512×512, de hasta 10 s, con su sonido.',
    helpStep2: 'Abre WhatsApp, entra al teclado de stickers y toca Crear sticker.',
    helpStep3: 'Elige el video guardado. En el editor, deja el audio original con el botón de audio y envía.',
    helpNote: 'Los stickers con sonido se están activando poco a poco en WhatsApp. Empezaron en Android; si no ves el botón de audio, aún no te llega.',
    helpPrivacyTitle: 'Tus archivos',
    helpPrivacy: 'Todo se procesa en tu dispositivo. Nada se sube a ningún servidor.',
    waSend: 'enviar con sonido a whatsapp', waSent: 'Listo. Está en tu chat contigo mismo ("Tú"): ábrelo, mantén presionado el sticker y reenvíalo.',
    waLinkTitle: 'vincular whatsapp', waLinkWarn: 'Soundstick se vincula como un dispositivo más, igual que WhatsApp Web. Solo envía a tu propio chat, nunca lee tus conversaciones y se desconecta al terminar. Es un método no oficial: WhatsApp podría limitar la cuenta si se abusa. Úsalo con calma, pocas veces al día.',
    waCountry: 'código de país', waPhone: 'tu número', waPhoneHint: 'sin el código de país, ej. 3001234567', waGetCode: 'pedir código', waCodeIntro: 'En WhatsApp: Ajustes > Dispositivos vinculados > Vincular un dispositivo > Vincular con número de teléfono. Escribe este código:', waWaiting: 'esperando que lo escribas...', waLinkedOk: 'cuenta vinculada', waUnlink: 'desvincular', waCancel: 'cerrar', waWorking: 'conectando...',
    waErrPairRate: 'WhatsApp limitó los intentos de vincular por ahora. No insistas: espera un par de horas y prueba una sola vez.', waErrPairWait: 'Espera 3 minutos antes de pedir otro código, para no activar el límite de WhatsApp.',
    waErrGap: 'Espera unos segundos entre envíos.', waErrHour: 'Llegaste al límite por hora (15). Prueba más tarde para cuidar tu cuenta.', waErrNotLinked: 'Primero vincula tu cuenta.', waErrPhone: 'WhatsApp no aceptó el número. Revisa el código de país (Colombia es 57) y que sea el número de esta cuenta.', waErrNoAudio: 'Este clip no tiene sonido; agrega un audio.', waErrBig: 'El sticker pesa demasiado; prueba un clip más corto o más simple.', waErrConnect: 'No pude conectar con WhatsApp. Revisa tu internet.', waErrGeneric: 'No pude enviarlo. Inténtalo de nuevo.',
    helpLimits: 'Límites: video hasta {mb} MB, audio {am} MB, imagen {im} MB, clip final hasta {s} s.',
  },
  en: {
    updAvail: 'new version available ({v})', updGet: 'download', updLater: 'later', dlAndroid: 'download for android', dlHint: 'Android app that sends straight to WhatsApp. It is an unofficial client: use an account you can afford to risk.',
    cutLabel: 'trim', dSave: 'Save', dWa: 'Send to WhatsApp', dShare: 'Share',
    mVideo: 'Video', mVideoAudio: 'Video + audio', mImage: 'Image + audio', mVoice: 'Voice',
    stepsLabel: 'steps', stepPick: 'Pick', stepAdjust: 'Adjust', stepSend: 'Send', stepT1: 'What do you want to use?', stepT2: 'Adjust your sticker', stepT3: 'Ready to send', back: '‹ Back', next: 'Next ›', sumShape: 'Shape', sumLen: 'Length', sumFile: 'File',
    noSignal: 'no signal',
    navCreate: 'create', navLibrary: 'library', navHelp: 'help',
    srcVideo: 'video + sound', srcVideoAudio: 'video + audio', srcImageAudio: 'image + audio', srcVoice: 'voice',
    pickVideo: 'pick a video', pickImage: 'pick an image', pickVisualVoice: 'pick image or video',
    pickHintVideo: 'up to {mb} MB, trimmed to {s} s', pickHintImage: 'PNG, JPG or WEBP, up to {mb} MB',
    pickHintVoice: 'what shows while your voice plays',
    pickAudio: 'pick an audio', pickAudioHint: 'MP3, M4A, WAV, up to {mb} MB, trimmed to {s} s',
    changeAudio: 'other audio', changeVisual: 'other file',
    record: 'record voice', recordHint: 'up to {s} s, asks for microphone permission', recording: 'recording... {s} s', stopRec: 'stop', rerecord: 'record again',
    framingHint: 'drag to move the framing', zoom: 'zoom',
    play: 'play', pause: 'pause',
    trimVideo: 'video', trimAudio: 'audio', trimFrom: 'start', trimTo: 'end',
    trimLen: '{len} s of {max} s', fileSize: '{mb} of {max} MB', noWave: 'no audio waveform', trimSpan: 'length', tagVideo: 'video', tagImage: 'image', toolHelp: 'help!!!!', ready: 'ready', ticker: 'up to 10 seconds ... video 50 MB ... audio 10 MB ... image 5 MB ... no accounts, everything stays on your phone ...', ajustes: 'settings',
    save: 'save for sticker', share: 'send as video', shareNow: 'tap to send',
    loadingEngine: 'getting the editor ready...', loadingFile: 'reading the file...', exporting: 'exporting {p}%',
    saved: 'done, {mb} MB. Now in WhatsApp: sticker keyboard, create, pick this video', savedNext: 'steps in whatsapp',
    shareFallback: "This browser can't share files. I downloaded it so you can send it by hand.",
    shareAgain: 'Ready. Tap share again to open WhatsApp.',
    needAudio: 'The audio is missing, so I can not save yet.',
    errVideoType: "That file isn't a video.", errImageType: "That file isn't an image (use PNG, JPG or WEBP).", errAudioType: "That file isn't an audio.",
    errSize: 'It is {mb} MB; the maximum is {max} MB.',
    errDecode: "Your browser can't read this video. Try an MP4.", errImageDecode: "I couldn't open this image.",
    errVoiceSilent: 'Nothing was heard in the recording. Check that the microphone works and record again.', waErrBadAudio: 'The sticker audio came out empty or cut, so I did not send it. Try again; if it happens again, record again.',
    errAudioDecode: "I couldn't read this audio. Try MP3, M4A or WAV.",
    errMic: "I couldn't use the microphone. Check the browser permission.",
    errExport: "I couldn't export this clip. Try a shorter one.",
    toolVolume: 'volume', toolSpeed: 'speed', toolFade: 'fade', toolText: 'text', toolFormat: 'format', fitFill: 'fill', fitWhole: 'whole', fitBg: 'background', bgBlur: 'blur', colBlack: 'black', shapeLabel: 'shape', bgClear: 'transparent', fitHint: "The shape sets the proportions. Fill crops to cover it; Whole shows everything. The surroundings stay transparent on WhatsApp (MP4 can't keep transparency, so it fills them black).",
    volOriginal: 'video sound', volAdded: 'added audio', volVoice: 'your voice', volAudio: 'audio',
    fadeOff: 'none', fadeHint: 'fades in and out', speedHint: 'the final clip lasts {s} s',
    textPlaceholder: 'write something or an emoji', textPos: 'position', posTop: 'top', posCenter: 'center', posBottom: 'bottom', textColor: 'color', textSize: 'size',
    colWhite: 'white', colLime: 'lime', colCyan: 'cyan', colMagenta: 'magenta', colYellow: 'yellow',
    libEmpty: 'No stickers yet. The ones you save show up here, on this device only.',
    libShare: 'share', libDownload: 'download', libDelete: 'delete', libSure: 'sure?',
    hLegal: 'Legal', hLegalNote: 'Soundstick is free software (GPL-3.0). It is not affiliated with WhatsApp or Meta.',
    lgPrivacy: 'Privacy Policy', lgTerms: 'Terms of Use', lgDisclaimer: 'Legal notice', lgData: 'Data processing (Colombia)', lgUse: 'Acceptable use', lgCopyright: 'Copyright', lgThird: 'Third-party licenses', lgSecurity: 'Security', lgPerms: 'Permissions and storage',
    lgAgree1: 'I have read and accept the', lgAgree2: 'and the',
    hCreate: 'Make a sticker', hCreate1: 'Pick a mode (video, video + audio, image + audio or voice) and add your file.', hCreate2: 'Adjust the shape, trim up to 10 seconds and change volume, speed or fade if you like.', hCreate3: 'Tap Save to keep it, or Send to WhatsApp to get it with sound in your chat.',
    hLink: 'Connect WhatsApp', hLink1: 'Tap Send to WhatsApp. The first time it asks you to link your account.', hLink2: 'Type your number with your country code and tap Get code.', hLink3: 'In WhatsApp go to Settings, Linked devices, Link a device and choose Link with phone number.', hLink4: 'Type the code Soundstick shows you. You only do this once.',
    hLinkNote: 'The sticker arrives in your chat with yourself (You). From there, long-press it to forward or save it.',
    hLimits: 'Limits', hLimVideo: 'Video: up to {mb} MB', hLimAudio: 'Audio: up to {mb} MB', hLimImage: 'Image: up to {mb} MB', hLimLen: 'Final sticker: up to {s} seconds',
    hSafe: 'Protect your account', hSafeText: 'Soundstick is not an official WhatsApp app. To lower the risk it only sends to your own chat and limits sends. Use it calmly and, if you can, with a secondary number.',
    hPrivacy: 'Everything is processed on your phone. Soundstick does not read your chats or photos and does not upload your files to any server.',
    wlWarn: 'This is an unofficial method: WhatsApp could limit the account if abused. Use it a few times a day.', wlStep1: 'Step 1 of 2 · Your number', wlStep2: 'Step 2 of 2 · Enter the code in WhatsApp',
    wlHow1: 'Open WhatsApp and go to Settings', wlHow2: 'Tap Linked devices', wlHow3: 'Link a device', wlHow4: 'Link with phone number', wlHow5: 'Enter this code:',
    wlLinked: 'Your WhatsApp is linked. You can now send stickers to your chat.',
    helpTitle: 'getting it into whatsapp',
    helpStep1: 'Make and save your sticker here: you get a square 512×512 MP4, up to 10 s, with its sound.',
    helpStep2: 'Open WhatsApp, go to the sticker keyboard and tap Create sticker.',
    helpStep3: 'Pick the saved video. In the editor, keep the original audio with the audio button and send.',
    helpNote: 'Sound stickers are rolling out gradually in WhatsApp. They started on Android; if you do not see the audio button, it has not reached you yet.',
    helpPrivacyTitle: 'Your files',
    helpPrivacy: 'Everything is processed on your device. Nothing is uploaded to any server.',
    waSend: 'send with sound to whatsapp', waSent: 'Done. It is in your chat with yourself ("You"): open it, long-press the sticker and forward it.',
    waLinkTitle: 'link whatsapp', waLinkWarn: 'Soundstick links as one more device, like WhatsApp Web. It only sends to your own chat, never reads your conversations and disconnects when done. This is an unofficial method: WhatsApp could limit the account if abused. Use it calmly, a few times a day.',
    waCountry: 'country code', waPhone: 'your number', waPhoneHint: 'without country code, e.g. 5551234567', waGetCode: 'get code', waCodeIntro: 'In WhatsApp: Settings > Linked devices > Link a device > Link with phone number. Enter this code:', waWaiting: 'waiting for you to enter it...', waLinkedOk: 'account linked', waUnlink: 'unlink', waCancel: 'close', waWorking: 'connecting...',
    waErrPairRate: 'WhatsApp limited linking attempts for now. Do not insist: wait a couple of hours and try once.', waErrPairWait: 'Wait 3 minutes before asking for another code, to avoid WhatsApp limits.',
    waErrGap: 'Wait a few seconds between sends.', waErrHour: 'You hit the hourly limit (15). Try later to protect your account.', waErrNotLinked: 'Link your account first.', waErrPhone: 'WhatsApp did not accept the number. Check the country code and that it is the number of this account.', waErrNoAudio: 'This clip has no sound; add an audio.', waErrBig: 'The sticker is too big; try a shorter or simpler clip.', waErrConnect: 'Could not reach WhatsApp. Check your internet.', waErrGeneric: 'Could not send it. Try again.',
    helpLimits: 'Limits: video up to {mb} MB, audio {am} MB, image {im} MB, final clip up to {s} s.',
  },
} as const

export type Key = keyof (typeof dict)['es']
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key, vars?: Record<string, string | number>) => string }

const I18n = createContext<Ctx | null>(null)

function initialLang(): Lang {
  const saved = localStorage.getItem('lang')
  const lang: Lang = saved === 'es' || saved === 'en' ? saved : navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  document.documentElement.lang = lang
  return lang
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('lang', l)
    document.documentElement.lang = l
    setLangState(l)
  }, [])
  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k, vars) => dict[lang][k].replace(/\{(\w+)\}/g, (_, n: string) => String(vars?.[n] ?? '')),
    }),
    [lang, setLang],
  )
  return <I18n.Provider value={value}>{children}</I18n.Provider>
}

export function useT() {
  const c = useContext(I18n)
  if (!c) throw new Error('I18nProvider missing')
  return c
}
