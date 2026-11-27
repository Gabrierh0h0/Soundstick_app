# Política de Privacidad

**Soundstick** · Última actualización: 27 de noviembre de 2026

> **English summary.** Soundstick runs on your device. Your videos, images, audio and voice recordings are processed locally and are never uploaded to our servers (we have none). Only when you tap "Send to WhatsApp" is the finished sticker and its audio sent to WhatsApp, to your own chat. The app contacts GitHub to check for updates and, on the web version, Vercel serves the page. There are no accounts, ads, analytics or tracking. You can unlink WhatsApp and delete everything at any time. Full details below (in Spanish).

## 1. Quién es el responsable

Soundstick es una aplicación gratuita y de código abierto creada y mantenida por **Gabrierh0h0**, desarrollador individual en Colombia ("nosotros", "el responsable"). Para cualquier asunto de privacidad escribe a través de [GitHub Issues](https://github.com/Gabrierh0h0/Soundstick_app/issues) o, si prefieres no hacerlo público, usa el contacto privado del perfil de GitHub del responsable.

## 2. Qué datos tratamos y para qué

Soundstick **no tiene servidores propios, cuentas de usuario, publicidad ni analítica**. Esto es lo único que ocurre con tus datos:

| Dato | Para qué | Dónde queda |
| --- | --- | --- |
| **Videos, imágenes y audios** que eliges | Crear el sticker | Se procesan en tu dispositivo (ffmpeg). No se suben a nosotros. |
| **Grabación de voz** (micrófono) | Usarla como sonido del sticker | Solo mientras grabas; se procesa en tu dispositivo. |
| **Tu número de teléfono** (al vincular WhatsApp) | Pedir a WhatsApp el código de vinculación | Se envía a WhatsApp. No lo guardamos en ningún servidor nuestro. |
| **Sesión de WhatsApp** (claves del dispositivo vinculado) | Poder enviarte el sticker sin vincular cada vez | Almacenamiento privado de la app en tu teléfono. Se borra al desvincular o desinstalar. |
| **El sticker y su audio** | Entregártelos en tu chat «Tú» | Se envían a WhatsApp (cifrados por WhatsApp) cuando tocas enviar. |
| **Biblioteca de stickers guardados** | Que los tengas a mano | Almacenamiento local de la app (IndexedDB). Nunca sale del dispositivo. |
| **Contadores de seguridad** (hora del último envío, intentos de vinculación) | Respetar los límites que te protegen de bloqueos | Almacenamiento privado de la app. |
| **Idioma elegido** | Mostrar la app en tu idioma | Almacenamiento local. |
| **Tu dirección IP** | Consultar si hay una versión nueva (GitHub) y, en la versión web, servir la página (Vercel) | La ven esos proveedores como en cualquier conexión a internet. |

No vendemos ni compartimos tus datos, no hacemos perfiles ni decisiones automatizadas, y no usamos tus datos para entrenar modelos.

## 3. Bases y autorización

Tratamos estos datos porque tú los proporcionas y pides la función (ejecución del servicio que solicitas) y, donde la ley lo exige, con tu **autorización previa, expresa e informada**, que das al aceptar esta política y los [Términos](TERMS.md) antes de vincular WhatsApp. En Colombia aplican la Ley 1581 de 2012 y el Decreto 1074 de 2015; ver la [Política de Tratamiento de Datos Personales](DATA-POLICY-CO.md).

## 4. Permisos de Android

| Permiso | Motivo |
| --- | --- |
| Internet | Enviar el sticker a WhatsApp y consultar actualizaciones. |
| Micrófono | Grabar tu voz cuando tú lo pides. |
| Servicio en primer plano (sincronización de datos) y notificaciones | Mantener la conexión con WhatsApp mientras envías o vinculas; muestra una notificación visible y se detiene al terminar. |
| Ajustes de audio | Reproducir y grabar audio. |

Detalle en [Permisos y almacenamiento](PERMISSIONS-AND-STORAGE.md).

## 5. Terceros que intervienen

- **WhatsApp (Meta Platforms)**: recibe tu número en la vinculación y el sticker y su audio al enviarlos. Se rige por su propia [política de privacidad](https://www.whatsapp.com/legal/privacy-policy).
- **GitHub (Microsoft)**: aloja el código y las versiones; recibe tu IP cuando la app consulta la última versión o descargas el APK. [Declaración de privacidad](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
- **Vercel**: aloja la versión web y puede registrar IP y datos técnicos de la visita. [Política](https://vercel.com/legal/privacy-policy).

Las fuentes tipográficas están incluidas en la app; no se descargan de Google ni de otros servicios.

## 6. Cuánto tiempo conservamos los datos

No conservamos tus datos: viven en tu dispositivo y los controlas tú. **Desvincular WhatsApp** dentro de la app borra la sesión; **desinstalar** la app borra todo lo demás. Puedes borrar stickers de la biblioteca uno a uno. Los proveedores de la sección 5 conservan sus propios registros según sus políticas.

## 7. Tus derechos

Según tu país tienes derecho a **conocer, actualizar, rectificar, suprimir** tus datos, **revocar** la autorización, **oponerte**, pedir **portabilidad** y presentar **reclamos** ante la autoridad (en Colombia, la [Superintendencia de Industria y Comercio](https://www.sic.gov.co); en la UE, tu autoridad de protección de datos; en California, la CCPA/CPRA). Como no almacenamos tus datos en servidores nuestros, casi todo lo ejerces tú mismo desde la app. Si necesitas algo más, escríbenos (sección 1) y responderemos en los plazos de la [Política de Tratamiento](DATA-POLICY-CO.md).

## 8. Menores de edad

Soundstick está dirigida a personas de **13 años o más** (16 en la Unión Europea, o la edad mínima de WhatsApp en tu país, la que sea mayor). No recopilamos a sabiendas datos de menores de esa edad. Los menores de edad solo deben usarla con permiso y supervisión de su madre, padre o tutor. Si crees que un menor nos dio datos, avísanos.

## 9. Seguridad

Todo se procesa localmente; la sesión de WhatsApp se guarda en el almacenamiento privado de la app, sin copia de seguridad en la nube (`allowBackup=false`); las comunicaciones con WhatsApp van cifradas de extremo a extremo por el protocolo de WhatsApp y las demás por HTTPS. Ningún sistema es 100 % seguro. Para reportar una vulnerabilidad lee [SECURITY.md](SECURITY.md).

## 10. Transferencias internacionales

WhatsApp, GitHub y Vercel operan servidores en distintos países. Al usar esas funciones tus datos pueden tratarse fuera de tu país, bajo las garantías de esos proveedores.

## 11. Cambios

Si cambiamos esta política, publicaremos la nueva versión en el repositorio con su fecha y, si el cambio es importante, avisaremos en la app. Puedes ver el historial de cambios en GitHub.
