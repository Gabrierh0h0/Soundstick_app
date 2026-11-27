# Avisos de software de terceros y licencia del proyecto

**Soundstick** · Última actualización: 27 de noviembre de 2026

## Licencia de Soundstick

El código original de Soundstick se distribuye bajo la **GNU General Public License v3.0 o posterior** (`GPL-3.0-or-later`). El texto completo está en [LICENSE](../LICENSE).

**Por qué GPL:** la app incluye componentes con licencia GPL, entre ellos `go.mau.fi/libsignal` (GPL-3.0) y el núcleo de ffmpeg para WebAssembly (`@ffmpeg/core`, GPL-2.0-or-later, porque incluye codificadores como x264). Para cumplirlas, todo el programa se distribuye bajo GPL-3.0-or-later (compatible con GPL-2.0-or-later y con MPL-2.0).

**Código fuente correspondiente:** está disponible, para la versión exacta de cada release, en <https://github.com/Gabrierh0h0/Soundstick_app> (etiqueta `vX.Y.Z`). Quien reciba la app puede pedir y obtener las instrucciones para compilarla (ver README). Esto cumple la obligación de ofrecer el código fuente de la GPL.

**Oferta escrita (ffmpeg):** el código fuente de FFmpeg está en <https://ffmpeg.org/download.html> y el de las compilaciones a WebAssembly (`@ffmpeg/core`) en <https://github.com/ffmpegwasm/ffmpeg.wasm>. Si no puedes acceder a ellos, escribe por [GitHub Issues](https://github.com/Gabrierh0h0/Soundstick_app/issues) y te indicaremos cómo obtenerlos.

> Si algún día quieres otra licencia para tu código, tendrías que quitar o reemplazar los componentes GPL (libsignal, ffmpeg-core con x264) o separarlos legalmente; consulta antes con un abogado.

## Componentes de la interfaz y la app (npm)

| Componente | Licencia |
| --- | --- |
| React, React DOM | MIT |
| Capacitor (core, android, browser, filesystem, share) | MIT |
| @ffmpeg/ffmpeg, @ffmpeg/util | MIT |
| **@ffmpeg/core** (FFmpeg compilado a WebAssembly) | **GPL-2.0-or-later** |
| idb-keyval | Apache-2.0 |
| vite-plugin-pwa y herramientas de compilación (Vite, TypeScript, Vitest, oxlint) | MIT / Apache-2.0 |

## Tipografías (incluidas en la app)

Archivo Black, Monoton, Orbitron, Oxanium, Rubik Glitch, Share Tech Mono, Silkscreen y VT323: **SIL Open Font License 1.1**. Special Elite: **Apache-2.0**. Distribuidas mediante los paquetes `@fontsource/*`.

## Núcleo de WhatsApp (Go)

| Módulo | Licencia |
| --- | --- |
| **go.mau.fi/whatsmeow** | **MPL-2.0** — código fuente: <https://github.com/tulir/whatsmeow> (usado sin modificaciones) |
| **go.mau.fi/libsignal** | **GPL-3.0** |
| go.mau.fi/util | MPL-2.0 |
| github.com/coder/websocket | ISC |
| github.com/beeper/argo-go | ver repositorio del módulo (Automattic Inc.) |
| google.golang.org/protobuf, golang.org/x/*, filippo.io/edwards25519, github.com/google/uuid, github.com/remyoudompheng/bigfft, modernc.org/sqlite | BSD-3-Clause (autores de Go / Google / SQLite Authors) |
| github.com/rs/zerolog, github.com/mattn/go-colorable, github.com/ncruces/go-strftime | MIT |
| github.com/mattn/go-isatty, github.com/dustin/go-humanize | MIT |
| github.com/petermattis/goid | Apache-2.0 |
| github.com/elliotchance/orderedmap, github.com/vektah/gqlparser | MIT |

El listado completo y las versiones exactas están en `native/wacore/go.mod`; cada módulo mantiene sus avisos de derechos de autor, que se conservan en su repositorio.

## Marcas

WhatsApp, Meta, Android, Google, GitHub y otras marcas citadas pertenecen a sus titulares. Ver [DISCLAIMER.md](DISCLAIMER.md).
