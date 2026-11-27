head = open('board.html', encoding='utf-8').read().split('<h1>')[0]

extra_css = '''
<style>
body{width:1500px}
.win{margin:6px 8px 8px}
.tb{height:30px;font-size:20px}
.tb .ic{display:flex;gap:6px}
.banner{height:76px;position:relative;overflow:hidden;background:linear-gradient(90deg,#7fe3ee 0%,#fff 40%,#ff9ad8 75%,#b04dd8 100%);border-bottom:2px solid var(--edge)}
.logo{position:absolute;left:-14px;right:-10px;top:-4px;text-align:center;white-space:nowrap;font:italic 400 60px/1 'Archivo Black';letter-spacing:-2px;color:transparent;background:linear-gradient(180deg,#fff 0,#ffd0f0 35%,#e03ac8 55%,#5a1aa0 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-stroke:2px #3b0f6b;filter:drop-shadow(3px 3px 0 rgb(59 15 107/.55))}
.tick{background:#1a0a3a;color:#7dff9a;font:17px/1 VT323;text-transform:uppercase;padding:4px 0 3px;white-space:nowrap;overflow:hidden;border-bottom:2px solid var(--edge)}
.tick span{display:inline-block;padding-left:14px}
.body{flex:1;display:flex;flex-direction:column;gap:12px;padding:12px;min-height:0}
.stepbar{display:flex;gap:6px;align-items:center}
.stepbar .s{flex:1;display:grid;gap:5px;font:700 12px Oxanium;color:#6d56a3}
.stepbar .s i{display:block;height:10px;border:2px solid;border-color:var(--edge) #fff #fff var(--edge);background:#fff}
.stepbar .s.d{color:var(--ink)}
.stepbar .s.d i{background:linear-gradient(180deg,#ffd0f0,#e03ac8)}
h2{font:700 21px/1.1 Oxanium}
.modes{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mode{min-height:64px;padding:8px 10px;display:flex;align-items:center;gap:10px;background:var(--lil);border:2px solid;border-color:#fff var(--edge) var(--edge) #fff;font:700 14px/1.1 Oxanium}
.mode small{display:block;font:400 12px Oxanium;color:#5a1aa0;margin-top:2px}
.mode.on{background:var(--yel);border-color:var(--edge) #fff #fff var(--edge)}
.mode .gl{flex:none;width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(180deg,#ffd0f0,#e03ac8 60%,#b02bb8);border:2px solid #3b0f6b;color:#fff}
.slot{flex:1;min-height:150px;display:grid;place-content:center;justify-items:center;gap:6px;text-align:center;border:3px dashed #8a6cc4;background:#f4ecff}
.slot .gl{width:62px;height:62px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(180deg,#9be9f4,#2a9fc4);border:3px solid #3b0f6b;box-shadow:4px 4px 0 rgb(59 15 107/.5);color:#fff}
.slot .gl svg{width:32px;height:32px}
.slot b{font:700 19px Oxanium}
.slot small{font:400 13px Oxanium;color:#5a1aa0}
.alert{border:2px solid;border-color:#fff var(--edge) var(--edge) #fff;background:#fff2f2;border-left:8px solid #d40000;padding:12px;display:grid;gap:10px}
.alert b{font:700 17px Oxanium;color:#8a0000}
.alert .row2{display:flex;gap:10px;align-items:center}
.alert .x{flex:none;width:30px;height:30px;border-radius:50%;background:#d40000;color:#fff;display:grid;place-items:center;font:700 18px Oxanium}
.scene{width:78%;aspect-ratio:16/9;border:3px solid #3b0f6b;border-radius:10px;overflow:hidden;position:relative;box-shadow:4px 4px 0 rgb(59 15 107/.5);background:linear-gradient(180deg,#ffb36b 0,#ff7ab8 45%,#7a3bd0 100%)}
.scene::before{content:'';position:absolute;left:50%;top:34%;width:46px;height:46px;border-radius:50%;background:#ffe9a8;transform:translateX(-50%)}
.scene::after{content:'';position:absolute;left:-10%;right:-10%;bottom:-30%;height:60%;border-radius:50%;background:#2a0a50}
.film{position:relative;height:66px;background:#120828;border:2px solid;border-color:var(--edge) #fff #fff var(--edge);display:flex}
.film i{flex:1;border-right:1px solid #120828}
.film .dim{position:absolute;top:0;bottom:0;background:rgb(18 8 40/.68)}
.win2{position:absolute;top:-2px;bottom:-2px;border-top:4px solid #ff4fc3;border-bottom:4px solid #ff4fc3}
.handle{position:absolute;top:-6px;bottom:-6px;width:20px;border-radius:6px;background:linear-gradient(180deg,#ffd0f0,#e03ac8 55%,#b02bb8);border:2px solid #3b0f6b;display:grid;place-items:center}
.handle::before{content:'';width:2px;height:22px;background:#fff;box-shadow:4px 0 #fff,-4px 0 #fff}
.head{position:absolute;top:-8px;bottom:-4px;width:3px;background:#7fe3ee;box-shadow:0 0 0 1px #120828}
.pips{display:flex;gap:4px}
.pips i{flex:1;height:12px;border:2px solid;border-color:var(--edge) #fff #fff var(--edge);background:#fff}
.pips i.l{background:linear-gradient(180deg,#d6ff6a,#7ab000)}
.step2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stp{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;min-height:48px;border:2px solid;border-color:var(--edge) #fff #fff var(--edge);background:#120828;color:#7dff9a;text-align:center;font:20px VT323}
.stp b{height:100%;display:grid;place-items:center;background:var(--lil);color:var(--ink);font:700 20px Oxanium;border:2px solid;border-color:#fff var(--edge) var(--edge) #fff}
.stp small{display:block;font:11px Oxanium;color:#cfc3e8;line-height:1}
.dock2{display:flex;gap:10px;padding:10px 12px 12px;border-top:2px solid #fff;background:var(--lil2)}
.off{opacity:.5}
.sheet{position:absolute;left:0;right:0;bottom:0;top:30%;background:var(--lil);border-top:3px solid #fff;border-radius:22px 22px 0 0;box-shadow:0 -8px 30px rgb(0 0 0/.5);padding:10px 14px 16px;display:grid;align-content:start;gap:11px}
.sheet .grab{width:44px;height:5px;border-radius:3px;background:#8a6cc4;margin:0 auto}
.veil{position:absolute;inset:0;background:rgb(18 8 40/.55)}
.sw{display:flex;gap:8px}
.sw i{width:40px;height:40px;border:2px solid;border-color:#fff var(--edge) var(--edge) #fff}
.sw i.on{border-color:var(--edge) #fff #fff var(--edge);outline:2px solid var(--ink)}
.seg2{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.seg2 div{min-height:44px;display:grid;place-items:center;font:700 14px Oxanium;background:var(--lil);border:2px solid;border-color:#fff var(--edge) var(--edge) #fff}
.seg2 .on{background:var(--yel);border-color:var(--edge) #fff #fff var(--edge)}
.card{border:2px solid;border-color:#fff var(--edge) var(--edge) #fff;background:var(--lil2);padding:10px 12px;display:grid;gap:8px}
.kv{display:flex;justify-content:space-between;font:700 14px Oxanium}
.kv span{font:400 14px Oxanium;color:#5a1aa0}
.meter{height:12px;border:2px solid;border-color:var(--edge) #fff #fff var(--edge);background:#120828}
.meter i{display:block;height:100%;width:64%;background:linear-gradient(180deg,#d6ff6a,#7ab000)}
.code{font:44px/1 VT323;letter-spacing:6px;text-align:center;padding:10px 0;color:#7dff9a}
.ol{display:grid;gap:6px;font:14px/1.25 Oxanium;padding:0;list-style:none}
.ol li{display:grid;grid-template-columns:24px 1fr;gap:8px;align-items:start}
.ol b{width:24px;height:24px;border-radius:50%;background:#e03ac8;color:#fff;display:grid;place-items:center;font:700 13px Oxanium}
.cap{max-width:420px}
.grid3{display:grid;grid-template-columns:repeat(3,420px);gap:34px 36px}
</style>'''


def phone(inner, cap_t, cap_b):
    return ('<div><div class="phone"><div class="screen"><div class="status"><span>9:41</span><span>5G ▮▮▮</span></div>'
            + inner + '</div></div><div class="cap"><b>' + cap_t + '</b>' + cap_b + '</div></div>')


def top(title='asistente de stickers'):
    return ('<div class="win bev"><div class="tb"><span>' + title + '</span><span class="ic"><span class="help">'
            '<svg class="i" style="width:16px;height:16px"><use href="#lib"/></svg></span><span class="help">?</span></span></div>'
            '<div class="banner"><div class="logo">soundstick</div></div>'
            '<div class="tick"><span>hasta 10 segundos ... video 50 MB ... audio 10 MB ... imagen 5 MB ... sin cuentas, todo queda en tu teléfono ...</span></div>')


def steps(n):
    labels = ['1 Elegir', '2 Ajustar', '3 Enviar']
    return '<div class="stepbar">' + ''.join(
        '<div class="s%s"><i></i>%s</div>' % (' d' if i < n else '', l) for i, l in enumerate(labels)) + '</div>'


def modes(sel=0):
    items = [('cam', 'Video + sonido', 'con su audio'), ('spk', 'Video + audio', 'otro sonido'),
             ('img', 'Imagen + audio', 'foto y sonido'), ('mic', 'Voz', 'la grabas ahora')]
    return '<div class="modes">' + ''.join(
        '<div class="mode%s"><span class="gl"><svg class="i"><use href="#%s"/></svg></span><div>%s<small>%s</small></div></div>'
        % (' on' if i == sel else '', k, t, s) for i, (k, t, s) in enumerate(items)) + '</div>'


def dock(left, right, off=False):
    return ('<div class="dock2"><div class="btn bev" style="flex:1">%s</div><div class="btn bev pri%s" style="flex:2">%s</div></div>'
            % (left, ' off' if off else '', right))


film = ''.join('<i style="background:linear-gradient(180deg,hsl(%d 90%% %d%%),hsl(%d 60%% 38%%))"></i>'
               % (20 + i * 8, 62 - i * 2, 300 - i * 6) for i in range(9))

s1 = phone(top() + '<div class="body">' + steps(1) + '<h2>¿Qué quieres usar?</h2>' + modes(0)
           + '<div class="slot"><span class="gl"><svg class="i"><use href="#cam"/></svg></span><b>Elige un video</b>'
             '<small>hasta 50 MB, se recorta a 10 s</small></div></div>' + dock('‹ Atrás', 'Siguiente ›', True) + '</div>',
           '1 · Elegir (vacío)',
           'Los cuatro modos como tarjetas grandes en vez de una tira que se sale. El hueco para el archivo es una bandeja con borde punteado, sin la bola rosa ni el «hola». Siguiente espera hasta que haya archivo.')

s1b = phone(top() + '<div class="body">' + steps(1) + '<h2>¿Qué quieres usar?</h2>' + modes(0)
            + '<div class="alert"><div class="row2"><span class="x">!</span><b>Pesa 82 MB; el máximo es 50 MB.</b></div>'
              '<div class="btn bev" style="min-height:44px">Elegir otro video</div></div>'
              '<div class="slot off" style="min-height:80px"><small>hasta 50 MB, se recorta a 10 s</small></div></div>'
            + dock('‹ Atrás', 'Siguiente ›', True) + '</div>',
            '1 · Elegir (límite)',
            'Los avisos de peso y de formato siguen, pero pegados a lo que los causó, con un botón para elegir otro archivo. El letrero verde de arriba conserva los límites, como ahora.')

s2 = phone(top() + '<div class="body">' + steps(2) + '<h2>Ajusta tu sticker</h2>'
           '<div class="stage checker" style="aspect-ratio:auto;height:190px"><div class="scene"></div>'
           '<span class="tag" style="left:8px;top:8px">16:9 · 512×288</span>'
           '<div class="play" style="width:40px;height:40px"><svg class="i"><use href="#play"/></svg></div></div>'
           '<div class="chips"><div class="chip">1:1</div><div class="chip on">16:9</div><div class="chip">9:16</div><div class="chip">4:3</div><div class="chip">3:4</div></div>'
           '<div><div class="lab"><span>Recorte</span><span>4,2 s de 10 s</span></div>'
           '<div class="pips"><i class="l"></i><i class="l"></i><i class="l"></i><i class="l"></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>'
           '<div class="film" style="margin:0 10px">' + film
           + '<div class="dim" style="left:0;width:18%"></div><div class="dim" style="right:0;width:40%"></div>'
           '<div class="win2" style="left:18%;right:40%"></div>'
           '<div class="handle" style="left:calc(18% - 18px)"></div><div class="handle" style="right:calc(40% - 18px)"></div>'
           '<div class="head" style="left:34%"></div></div>'
           '<div class="step2"><div class="stp"><b>−</b><div>0:01.2<small>inicio</small></div><b>+</b></div>'
           '<div class="stp"><b>−</b><div>0:05.4<small>fin</small></div><b>+</b></div></div>'
           '<div class="chip" style="justify-content:space-between;min-height:46px">Más ajustes <em>volumen, velocidad, texto</em>'
           '<span style="font:700 16px Oxanium">›</span></div></div>' + dock('‹ Atrás', 'Siguiente ›') + '</div>',
           '2 · Ajustar',
           'El recorte deja de ser una barra lisa. Es una tira de fotogramas con manijas rosas grandes y fáciles de agarrar, la parte elegida iluminada y el resto oscuro, y una barra de segmentos que muestra cuánto llevas de los 10 s. Abajo, botones − y + para afinar al décimo.')

s2b = phone(top() + '<div class="body off">' + steps(2) + '<h2>Ajusta tu sticker</h2>'
            '<div class="stage checker" style="aspect-ratio:auto;height:190px"><div class="scene"></div></div></div><div class="veil"></div>'
            '<div class="sheet"><div class="grab"></div><h2>Más ajustes</h2>'
            '<div class="fader"><span>Volumen</span><div class="t"><b style="left:62%"></b></div><output>100%</output></div>'
            '<div class="fader"><span>Velocidad</span><div class="t"><b style="left:38%"></b></div><output>1x</output></div>'
            '<div class="fader"><span>Fundido</span><div class="t"><b style="left:8%"></b></div><output>off</output></div>'
            '<div><div class="lab"><span>Encuadre</span></div><div class="seg2"><div class="on">Llenar</div><div>Completo</div></div></div>'
            '<div><div class="lab"><span>Lo que rodea la imagen</span></div><div class="sw"><i class="checker on"></i>'
            '<i style="background:linear-gradient(135deg,#e03ac8,#7fe3ee)"></i><i style="background:#000"></i><i style="background:#fff"></i>'
            '<i style="background:#9ccc00"></i><i style="background:#00aeef"></i></div></div>'
            '<div class="chip" style="min-height:46px">Texto sobre el sticker <em style="margin-left:auto">ninguno</em></div>'
            '<div class="btn bev pri" style="min-height:48px">Listo</div></div></div>',
            '2 · Más ajustes',
            'Volumen, velocidad, fundido, encuadre, fondo y texto en una hoja que sube desde abajo. Se cierra con «Listo»; ya no hay un acordeón al final de la pantalla.')

s3 = phone(top() + '<div class="body">' + steps(3) + '<h2>Listo para enviar</h2>'
           '<div class="stage checker" style="aspect-ratio:auto;height:170px"><div class="scene" style="width:70%"></div></div>'
           '<div class="card"><div class="kv">Forma<span>16:9 · 512×288</span></div><div class="kv">Duración<span>4,2 s</span></div>'
           '<div class="kv">Peso<span>612 KB de 950 KB</span></div><div class="meter"><i></i></div>'
           '<div class="kv">Sonido<span>Opus 32 kbps</span></div></div>'
           '<div class="btn bev" style="min-height:48px"><svg class="i"><use href="#save"/></svg>Guardar en el teléfono</div></div>'
           + dock('‹ Atrás', '<svg class="i"><use href="#send"/></svg>Enviar a WhatsApp') + '</div>',
           '3 · Enviar',
           'Resumen con las medidas reales del sticker y un medidor de peso contra el límite de WhatsApp. Un solo botón rosa grande para enviar, y Guardar como alternativa.')

s3b = phone(top() + '<div class="body">' + steps(3) + '<h2>Vincula WhatsApp, una sola vez</h2>'
            '<div class="card" style="font:13px/1.3 Oxanium">Soundstick se vincula como un dispositivo más, igual que WhatsApp Web. Solo envía a tu propio chat y nunca lee tus conversaciones. Es un método no oficial: úsalo con calma.</div>'
            '<div class="lcd"><div style="font-size:16px;color:#7fe3ee;text-align:center">tu código</div><div class="code">4K7M-9PQ2</div></div>'
            '<ul class="ol"><li><b>1</b>Abre WhatsApp, Ajustes, Dispositivos vinculados</li>'
            '<li><b>2</b>Vincular con número de teléfono</li><li><b>3</b>Escribe el código de arriba</li></ul>'
            '<div class="lcd" style="font-size:19px;text-align:center">esperando… 00:42</div></div>'
            + dock('Cancelar', 'Pedir otro código') + '</div>',
            '3 · Vincular (primera vez)',
            'El mismo asistente explica la vinculación: aviso corto, el código grande en pantalla LCD y tres pasos numerados. Al vincular, vuelve solo al envío.')

sym = '<symbol id="lib" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16"/></symbol>'
html = (head.replace('</defs>', sym + '</defs>', 1) + extra_css
        + '<h1>soundstick · la idea 2 en detalle</h1>'
          '<p class="sub">El asistente de tres pasos con el título cromado de siempre, el letrero verde con los límites, un recorte nuevo y un hueco de archivo sin la bola rosa.</p>'
          '<div class="grid3">' + s1 + s1b + s2 + s2b + s3 + s3b + '</div></body></html>')
open('board2.html', 'w', encoding='utf-8').write(html)
