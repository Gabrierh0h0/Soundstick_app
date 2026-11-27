# Permisos, almacenamiento local y cookies

**Soundstick** · Última actualización: 27 de noviembre de 2026

> **English summary.** The app asks only for the permissions it needs (internet, microphone, a visible foreground service while connected to WhatsApp, notifications). It stores data only on your device: your saved stickers, your language, WhatsApp session and safety counters. It uses no tracking cookies, ads or analytics.

## Permisos de la app de Android

| Permiso | Para qué | Cuándo |
| --- | --- | --- |
| `INTERNET` | Enviar el sticker a WhatsApp y consultar actualizaciones en GitHub | Al enviar/vincular y al abrir la app |
| `RECORD_AUDIO` | Grabar tu voz | Solo cuando tocas grabar; el sistema te pide permiso |
| `MODIFY_AUDIO_SETTINGS` | Reproducir y grabar audio correctamente | Al reproducir o grabar |
| `FOREGROUND_SERVICE` y `FOREGROUND_SERVICE_DATA_SYNC` | Mantener viva la conexión con WhatsApp mientras vinculas o envías | Solo durante esas acciones; se detiene al terminar |
| `POST_NOTIFICATIONS` | Mostrar la notificación obligatoria del servicio en primer plano | Durante esas acciones |

La app **no pide** acceso a tus contactos, ubicación, cámara, fotos, mensajes ni a tus chats. Los archivos que eliges los entrega el selector del sistema solo para esa acción.

Puedes retirar permisos en *Ajustes de Android → Apps → Soundstick → Permisos*.

## Datos guardados en tu dispositivo

| Qué | Dónde | Cómo borrarlo |
| --- | --- | --- |
| Stickers guardados (biblioteca) | Almacenamiento local de la app (IndexedDB) | Botón *borrar* en la biblioteca, o desinstalar |
| Sesión de WhatsApp | Almacenamiento privado de la app | *Desvincular* en la app, o desinstalar |
| Contadores de seguridad (último envío, intentos) | Almacenamiento privado de la app | Se reinician al desinstalar |
| Idioma | Almacenamiento local | Desinstalar o borrar datos del sitio |

## Versión web

La versión web (PWA) guarda estos datos en el **almacenamiento local del navegador** (IndexedDB y caché del service worker para funcionar sin conexión). **No usa cookies de seguimiento, publicidad ni analítica.** Puedes borrar todo desde los ajustes de tu navegador (*Borrar datos del sitio*). El proveedor de alojamiento (Vercel) puede registrar la IP y datos técnicos de la visita.

## Sin rastreo

No incluimos SDK de publicidad, analítica, rastreo ni informes de fallos que envíen datos a terceros.
