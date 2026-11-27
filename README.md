<div align="center">

# 🔊 Soundstick

**Crea stickers de WhatsApp con sonido y envíalos directo desde tu teléfono.**
*Make WhatsApp stickers with sound and send them straight from your phone.*

[![Última versión](https://img.shields.io/github/v/release/Gabrierh0h0/Soundstick_app?label=versi%C3%B3n&color=9ccc00)](https://github.com/Gabrierh0h0/Soundstick_app/releases/latest)
[![Android](https://img.shields.io/badge/Android-7.0%2B-00aeef)](#instalar)
[![Licencia](https://img.shields.io/badge/licencia-GPL--3.0-e3008c)](LICENSE)

[**⬇️ Descargar para Android**](https://github.com/Gabrierh0h0/Soundstick_app/releases/latest/download/soundstick.apk) · [Versión web](https://soundstick.vercel.app)

</div>

---

## ¿Qué hace?

WhatsApp tiene stickers con sonido, pero solo se pueden crear con su propio creador. Soundstick te deja hacerlos **al instante** a partir de lo que ya tienes y recibirlos en tu chat listos para reenviar.

| Modo | Qué usas |
| --- | --- |
| 🎬 **Video con sonido** | Un video; conserva su audio |
| 🎞️ **Video + audio** | Un video y un audio aparte |
| 🖼️ **Imagen + audio** | Una foto o imagen y un audio |
| 🎙️ **Voz** | Una imagen o video y tu voz grabada al momento |

**Y además:**

- ✂️ Recorte de hasta 10 s, volumen, velocidad, fundido y texto encima.
- 📐 **Formas:** 1:1, 16:9, 9:16, 4:3 y 3:4 con **borde transparente** de verdad.
- 🔒 Todo se procesa en tu teléfono (ffmpeg). No hay servidor ni cuentas.
- 🌐 Español e inglés. Estética de portal de los años 2000.

## Instalar

1. Descarga [`soundstick.apk`](https://github.com/Gabrierh0h0/Soundstick_app/releases/latest/download/soundstick.apk) en tu teléfono Android.
2. Ábrelo. Android te pedirá permitir **instalar apps de origen desconocido** para tu navegador o gestor de archivos; acéptalo solo para este archivo.
3. Si Play Protect avisa, es normal: la app no está en Play Store porque usa un cliente no oficial de WhatsApp.
4. En Xiaomi/MIUI activa *Instalar vía USB* si falla la instalación.

### Vincular WhatsApp (una sola vez)

La app se vincula como un **dispositivo adicional** (igual que WhatsApp Web) para poder enviarte el sticker.

1. En la app pulsa **enviar con sonido a whatsapp**.
2. Escribe tu número con código de país y pulsa **pedir código**.
3. En WhatsApp: *Ajustes → Dispositivos vinculados → Vincular con número de teléfono* e ingresa el código.

El sticker llega a tu chat contigo mismo («Tú»), desde donde lo reenvías o lo guardas.

## Actualizaciones

La app revisa al abrirse si hay una versión nueva en [Releases](https://github.com/Gabrierh0h0/Soundstick_app/releases). Si la hay, muestra una barra con **descargar**; al instalar el nuevo APK **se conserva tu vinculación de WhatsApp** (todos los APK van firmados con la misma llave).

### Publicar una actualización (para quien mantiene el proyecto)

1. Sube la versión en `package.json` y en `android/app/build.gradle` (`versionName` y `versionCode`).
2. Compila el APK firmado:
   ```powershell
   npm run build:android
   cd android
   .\gradlew.bat assembleRelease
   ```
3. Crea un release en GitHub con la etiqueta `vX.Y.Z` (por ejemplo `v1.0.1`), pon las notas en la descripción y sube `app-release.apk` **renombrado a `soundstick.apk`**.
4. Listo: quien tenga la app verá el aviso la próxima vez que la abra.

> ⚠️ Guarda la llave de firma (`.jks`) fuera del repositorio y con copia de seguridad. Si cambia, Android no dejará actualizar encima y todos tendrían que desinstalar y volver a vincular.

## Aviso importante

Soundstick **no es un producto de WhatsApp ni de Meta**. Usa un cliente no oficial ([whatsmeow](https://github.com/tulir/whatsmeow)) para enviar el sticker, y eso puede ir contra los términos de WhatsApp. No se puede garantizar que una cuenta no sea restringida.

Para reducir el riesgo la app:

- solo envía a **tu propio chat**, nunca a otras personas;
- espera 20 s entre envíos y permite 15 por hora;
- limita los intentos de vinculación (uno cada 3 min, 4 al día);
- no lee tus mensajes, chats ni fotos, y no tiene telemetría.

**Úsala con una cuenta secundaria o que puedas arriesgar.**

## Privacidad

Tus videos, imágenes, audios y grabaciones se procesan solo en el teléfono. Lo único que sale es el sticker y su audio, enviados a WhatsApp, y la consulta del último release en GitHub para avisarte de actualizaciones. La sesión de WhatsApp vive en el almacenamiento privado de la app; *desvincular* la borra.

## Legal

Soundstick es software libre bajo **GPL-3.0-or-later** ([LICENSE](LICENSE)). Documentos: [Privacidad](legal/PRIVACY.md) · [Términos](legal/TERMS.md) · [Aviso legal](legal/DISCLAIMER.md) · [Tratamiento de datos (Colombia)](legal/DATA-POLICY-CO.md) · [Uso aceptable](legal/ACCEPTABLE-USE.md) · [Derechos de autor](legal/COPYRIGHT.md) · [Avisos de terceros](legal/THIRD-PARTY-NOTICES.md) · [Seguridad](SECURITY.md) · [Permisos y almacenamiento](legal/PERMISSIONS-AND-STORAGE.md). Índice en [legal/](legal/README.md).

## Cómo está hecha

```
src/            Interfaz web (React 19 + TypeScript + Vite), ffmpeg.wasm
native/wacore/  Núcleo en Go (whatsmeow) compilado a Android con gomobile
android/        Proyecto Capacitor: plugin WaCore, servicio de conexión, firma
```

Un sticker con sonido es un **WebP animado** con un bloque EXIF que contiene el hash SHA-256 del audio, más el audio en **Opus** enviado aparte. WhatsApp los empareja por ese hash.

### Compilar desde el código

Requisitos: Node 22, JDK 21, Android SDK (plataforma 36, NDK 27), Go 1.24+ y `gomobile`.

```powershell
npm install
npm test                  # pruebas de la interfaz (Vitest)
cd native/wacore
go test ./...             # pruebas del núcleo
gomobile bind -target=android/arm64 -androidapi 24 -javapkg=app.soundstick -o ../../android/app/libs/wacore.aar .
cd ../..
npm run build:android
cd android
.\gradlew.bat assembleDebug
```

Para firmar un release crea `android/keystore.properties` con `storeFile`, `storePassword`, `keyAlias` y `keyPassword` (el archivo está en `.gitignore`).

La versión web (`npm run dev` / `npm run build`) funciona sin la app, pero solo exporta MP4 y no puede enviar a WhatsApp.

---

<div align="center">Hecho por <a href="https://github.com/Gabrierh0h0">Gabrierh0h0</a></div>
