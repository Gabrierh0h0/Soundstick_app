# Cambios

Todas las versiones de Soundstick. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado es [SemVer](https://semver.org/lang/es/).

## [1.0.2] — 2026-11-27

### Mejorado
- **Exportación mucho más rápida.** Los cuadros del video ahora los saca el decodificador del teléfono (recortados y con transparencia) y ffmpeg solo los codifica. Antes ffmpeg decodificaba el video completo y los reintentos de compresión lo repetían.
- **Barra de progreso real** al enviar a WhatsApp, que ya no retrocede entre intentos de compresión.
- **Los clips pesados ahora caben.** Si el sticker supera el tope, la app prueba más pasos de compresión, baja poco a poco los cuadros por segundo y, como último recurso, suaviza un poco el detalle fino. Si aun así no cabe, el aviso indica cuánto pesó.
- Tope de peso del WebP de 950 KB a 990 KB.

### Corregido
- El envío se quedaba en «exportando» cuando el recuadro de recorte tenía una medida impar o se pasaba un píxel del borde.
- Error «File could not be read! Code=-1» en algunos teléfonos: el archivo elegido ahora se copia a memoria al elegirlo.
- Se agregó un tiempo límite a ffmpeg para que una exportación atascada termine con un error en vez de quedarse colgada.

## [1.0.1] — 2026-11-27

### Nuevo
- Editor de una sola pantalla con **recorte libre**: eliges el recuadro y el resto queda transparente (Libre, 1:1, 16:9, 9:16, 4:3, 3:4).
- Línea de tiempo con miniaturas del video y ondas de sonido, con asas finas.
- Botón de grabar de voz renovado.
- Aplicación a pantalla completa con los márgenes correctos de la barra de estado.
- Ayuda y vinculación con WhatsApp con letra más legible.
- Documentos legales (privacidad, términos y más) y aceptación dentro de la app.

### Corregido
- Grabaciones de voz que a veces salían sin sonido: el audio se normaliza y se comprueba antes de enviar.
- El visor deja desplazar la página; el recuadro se mueve manteniendo el dedo.

## [1.0.0] — 2026-11

- Primera versión pública: stickers de WhatsApp con sonido a partir de video, video + audio, imagen + audio o voz, enviados al propio chat.
