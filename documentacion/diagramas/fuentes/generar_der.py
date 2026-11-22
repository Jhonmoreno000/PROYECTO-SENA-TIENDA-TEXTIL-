# Uso: python3 generar_der.py "BASE DE DATOS/01_esquema_espanol.sql" documentacion/diagramas
# Requiere Graphviz (dot) y Pillow. Genera der_simple y der_completo (PNG y SVG).
"""Genera der_simple y der_completo (Graphviz) a partir de BASE DE DATOS/01_esquema_espanol.sql."""
import re, sys, html, subprocess, pathlib, tempfile

SQL = sys.argv[1]
OUT = pathlib.Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

MOD = {  # módulo: (oscuro, claro, tablas)
    'Usuarios y acceso': ('#3b5ba9', '#e8eef9', ['usuarios', 'direcciones_usuario', 'actividad_reciente', 'auditoria_sistema']),
    'Catálogo': ('#2f7d45', '#eaf5ec', ['categorias', 'productos', 'imagenes_producto', 'resenas']),
    'Inventario': ('#a8641a', '#fbf1e3', ['lotes_inventario', 'rollos_textil', 'eventos_merma', 'umbrales_stock', 'inventario_telas_erp']),
    'Ventas': ('#8e3b7a', '#f6eaf3', ['items_carrito', 'pedidos', 'items_pedido', 'cupones', 'categorias_cupon', 'eventos_pago_wompi']),
    'Soporte': ('#555555', '#efefef', ['tickets_soporte', 'reportes_errores']),
    'Contenido del inicio y configuración': ('#21757c', '#e6f4f5', ['secciones_inicio', 'diapositivas_carrusel', 'banner_global', 'configuracion_sistema']),
    'Analítica (ERP)': ('#6b5a2e', '#f3efe6', ['metricas_ventas_erp', 'ventas_diarias', 'ventas_region', 'notificaciones_sistema_erp']),
}
MODULO = {t: m for m, (_, _, ts) in MOD.items() for t in ts}

ETIQUETA = {
    ('productos', 'categoria_id'): 'clasifica', ('productos', 'vendedor_id'): 'publica',
    ('imagenes_producto', 'producto_id'): 'tiene', ('lotes_inventario', 'producto_id'): 'recibe',
    ('eventos_merma', 'producto_id'): 'registra merma', ('eventos_merma', 'usuario_id'): 'registra',
    ('categorias_cupon', 'cupon_id'): 'aplica a', ('categorias_cupon', 'categoria_id'): 'admite',
    ('pedidos', 'usuario_id'): 'realiza', ('pedidos', 'vendedor_id'): 'despacha',
    ('items_pedido', 'pedido_id'): 'contiene', ('items_pedido', 'producto_id'): 'se vende en',
    ('items_carrito', 'usuario_id'): 'agrega', ('items_carrito', 'producto_id'): 'está en',
    ('resenas', 'producto_id'): 'recibe', ('resenas', 'usuario_id'): 'escribe',
    ('tickets_soporte', 'usuario_id'): 'abre', ('tickets_soporte', 'pedido_id'): 'se reclama en',
    ('tickets_soporte', 'asignado_a'): 'atiende', ('reportes_errores', 'vendedor_id'): 'reporta',
    ('reportes_errores', 'producto_id'): 'se reporta en', ('reportes_errores', 'asignado_a'): 'atiende',
    ('actividad_reciente', 'usuario_id'): 'genera', ('rollos_textil', 'producto_id'): 'se almacena en',
    ('direcciones_usuario', 'usuario_id'): 'guarda',
}
UNO_A_MUCHOS_OBLIGATORIO = {('items_pedido', 'pedido_id')}  # regla de negocio: no hay pedidos vacíos
LOGICAS = [  # (hija, columna, padre, columna padre, etiqueta)
    ('pedidos', 'codigo_cupon', 'cupones', 'codigo', 'usa (sin FK)'),
    ('diapositivas_carrusel', 'clave_seccion', 'secciones_inicio', 'clave', 'pertenece a (sin FK)'),
]

# ---------- lectura del esquema ----------
src = open(SQL, encoding='utf-8').read()
TABLAS, FKS = {}, []
for m in re.finditer(r'CREATE TABLE(?: IF NOT EXISTS)? +([a-z_]+) *\((.*?)\n\);', src, re.S):
    t, cuerpo = m.group(1), m.group(2)
    cols = []
    for raw in cuerpo.split('\n'):
        line = raw.strip().rstrip(',')
        if not line or line.startswith('--'):
            continue
        if re.match(r'(UNIQUE|PRIMARY KEY|FOREIGN KEY|CONSTRAINT|CHECK)\b', line, re.I):
            fk = re.match(r'FOREIGN KEY *\((\w+)\) *REFERENCES +(\w+)', line, re.I)
            if fk:
                FKS.append((t, fk.group(1), fk.group(2)))
            continue
        mm = re.match(r'(\w+) +([A-Z]+(?: PRECISION)?(?:\([\d, ]+\))?)(.*)', line)
        if not mm:
            continue
        nombre, tipo, resto = mm.groups()
        pk = 'PRIMARY KEY' in resto
        uk = bool(re.search(r'\bUNIQUE\b', resto))
        ref = re.search(r'REFERENCES +(\w+)', resto)
        nulo = not (pk or 'NOT NULL' in resto or tipo.startswith('SERIAL'))
        tipo = tipo.lower().replace(' ', '')
        cols.append(dict(n=nombre, tipo=tipo, pk=pk, uk=uk, fk=bool(ref), nulo=nulo))
        if ref:
            FKS.append((t, nombre, ref.group(1)))
    TABLAS[t] = cols
for t, c, p in FKS:
    for col in TABLAS[t]:
        if col['n'] == c:
            col['fk'] = True

faltan = set(TABLAS) - set(MODULO)
sobran = set(MODULO) - set(TABLAS)
assert not faltan and not sobran, (faltan, sobran)
assert all((t, c) in ETIQUETA for t, c, _ in FKS), [x for x in FKS if (x[0], x[1]) not in ETIQUETA]
CON_FK = {t for t, _, p in FKS} | {p for _, _, p in FKS}
SIN_FK = [t for t in TABLAS if t not in CON_FK]
NT, NF, NL = len(TABLAS), len(FKS), len(LOGICAS)
print(f'{NT} tablas, {NF} FK, {len(CON_FK)} con relaciones, {len(SIN_FK)} sin FK', file=sys.stderr)

E = html.escape


def titulo(texto, completo):
    tags = ''.join(f'<TD BGCOLOR="{d}" CELLPADDING="5"><FONT COLOR="white" POINT-SIZE="12"><B> {E(m)} </B></FONT></TD>'
                   for m, (d, _, _) in MOD.items())
    clave = ''
    if completo:
        clave = ('<TR><TD ALIGN="LEFT" CELLPADDING="4"><FONT POINT-SIZE="12">'
                 '<FONT COLOR="#b8860b"><B>PK</B></FONT> llave primaria &#160;&#160; '
                 '<FONT COLOR="#3b5ba9"><B>FK</B></FONT> llave foránea &#160;&#160; '
                 '<FONT COLOR="#2f7d45"><B>UK</B></FONT> valor único &#160;&#160; '
                 '<B>?</B> admite NULL</FONT></TD></TR>')
    return (f'<<TABLE BORDER="0" CELLSPACING="0" CELLPADDING="2">'
            f'<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="24"><B>{E(texto)}</B></FONT></TD></TR>'
            f'<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="13" COLOR="#555555">{NT} tablas · {NF} llaves foráneas · '
            f'{NL} relaciones lógicas sin FK · fuente: BASE DE DATOS/01_esquema_espanol.sql</FONT></TD></TR>'
            f'<TR><TD ALIGN="LEFT"><TABLE BORDER="0" CELLSPACING="6" CELLPADDING="0"><TR>{tags}</TR></TABLE></TD></TR>'
            f'{clave}</TABLE>>')


def leyenda():
    filas = [('teetee', 'crowodot', 'solid', 'uno a cero o muchos'),
             ('teeodot', 'crowodot', 'solid', 'cero o uno a cero o muchos (FK opcional)'),
             ('teetee', 'crowtee', 'solid', 'uno a uno o muchos'),
             ('teeodot', 'crowodot', 'dashed', 'relación lógica sin FK')]
    out = ['subgraph cluster_ley { label=<<B>Cardinalidad</B>>; fontsize=12; style="rounded"; color="#c9ced6"; bgcolor="white"; margin=12;']
    for i, (a, b, st, txt) in enumerate(filas):
        col = '#9aa0a8' if st == 'dashed' else '#5f6673'
        out.append(f'la{i} [label="A", shape=box, style=filled, fillcolor="#e5e7eb", color="#c9ced6", fontsize=10, width=0.3, height=0.25];')
        out.append(f'lb{i} [label="B", shape=box, style=filled, fillcolor="#e5e7eb", color="#c9ced6", fontsize=10, width=0.3, height=0.25];')
        out.append(f'lt{i} [label="{txt}", shape=plaintext, fontsize=11];')
    for i, (a, b, st, txt) in enumerate(filas):
        col = '#9aa0a8' if st == 'dashed' else '#5f6673'
        out.append(f'la{i} -> lb{i} [dir=both, arrowtail={a}, arrowhead={b}, style={st}, color="{col}", minlen=5];')
        out.append(f'lb{i} -> lt{i} [style=invis, minlen=1];')
    out.append('{rank=same; la0; la1; la2; la3;} {rank=same; lb0; lb1; lb2; lb3;} {rank=same; lt0; lt1; lt2; lt3;}')
    out.append('}')
    return '\n'.join(out)


def nodo_simple(t):
    d, _, _ = MOD[MODULO[t]]
    return (f'{t} [shape=plain, label=<<TABLE BORDER="1" COLOR="{d}" CELLBORDER="1" CELLSPACING="2" CELLPADDING="7">'
            f'<TR><TD BGCOLOR="{d}" COLOR="#ffffff"><FONT COLOR="white" POINT-SIZE="15"><B>{t}</B></FONT></TD></TR></TABLE>>];')


def nodo_completo(t):
    d, _, _ = MOD[MODULO[t]]
    filas = [f'<TR><TD COLSPAN="3" BGCOLOR="{d}" ALIGN="LEFT" CELLPADDING="7"><FONT COLOR="white" POINT-SIZE="15"><B>{t}</B></FONT></TD></TR>']
    for c in TABLAS[t]:
        clave = ('<FONT COLOR="#b8860b"><B>PK</B></FONT>' if c['pk'] else
                 '<FONT COLOR="#3b5ba9"><B>FK</B></FONT>' if c['fk'] else
                 '<FONT COLOR="#2f7d45"><B>UK</B></FONT>' if c['uk'] else '')
        nombre = f'<B>{c["n"]}</B>' if c['pk'] else c['n']
        tipo = c['tipo'] + (' ?' if c['nulo'] else '')
        filas.append(f'<TR><TD ALIGN="LEFT" PORT="{c["n"]}_l" WIDTH="22">' + (f'<FONT POINT-SIZE="9">{clave}</FONT>' if clave else ' ') + '</TD>'
                     f'<TD ALIGN="LEFT"><FONT POINT-SIZE="13">{nombre}</FONT></TD>'
                     f'<TD ALIGN="LEFT" PORT="{c["n"]}"><FONT POINT-SIZE="10" COLOR="#6b7280">{tipo}</FONT></TD></TR>')
    return (f'{t} [shape=plain, label=<<TABLE BORDER="1" COLOR="{d}" CELLBORDER="0" CELLSPACING="0" CELLPADDING="3" BGCOLOR="white">'
            + ''.join(filas) + '</TABLE>>];')


def arista(t, c, p, completo):
    col = next(x for x in TABLAS[t] if x['n'] == c)
    cola = 'teetee' if not col['nulo'] else 'teeodot'
    punta = 'crowtee' if (t, c) in UNO_A_MUCHOS_OBLIGATORIO else 'crowodot'
    a, b = (f'{p}:id:e', f'{t}:{c}_l:w') if completo else (p, t)
    return f'{a} -> {b} [dir=both, arrowtail={cola}, arrowhead={punta}, label="{ETIQUETA[(t, c)]}"];'


def logica(t, c, p, pc, etq, completo):
    a, b = (f'{p}:{pc}:e', f'{t}:{c}_l:w') if completo else (p, t)
    return (f'{a} -> {b} [dir=both, arrowtail=teeodot, arrowhead=crowodot, style=dashed, color="#9aa0a8", '
            f'label="{etq}"];')


BASE = 'graph [fontname="Inter", bgcolor="white", pad=0.15, {extra}];\nnode [fontname="Inter"];\nedge [fontname="Inter", fontsize=11, fontcolor="#3a3f47", color="#5f6673", penwidth=1.2, arrowsize=0.9];'


def render(dot, ruta):
    ruta.with_suffix('.dot').write_text(dot, encoding='utf-8')
    subprocess.run(['dot', '-Tsvg', '-o', str(ruta.with_suffix('.svg')), str(ruta.with_suffix('.dot'))], check=True)
    subprocess.run(['dot', '-Tpng', '-Gdpi=150', '-o', str(ruta.with_suffix('.png')), str(ruta.with_suffix('.dot'))], check=True)


def unir(partes, destino, gap=28):
    """Apila verticalmente varias salidas de Graphviz en un PNG y un SVG."""
    from PIL import Image
    ims = [Image.open(p.with_suffix('.png')).convert('RGB') for p in partes]
    esc = 150 / 72
    W = max(i.width for i in ims); H = sum(i.height for i in ims) + int(gap * esc) * (len(ims) - 1)
    lienzo = Image.new('RGB', (W, H), 'white'); y = 0
    for im in ims:
        lienzo.paste(im, (0, y)); y += im.height + int(gap * esc)
    lienzo.save(destino.with_suffix('.png'), optimize=True)
    bloques, y, ancho = [], 0.0, 0.0
    for p in partes:
        sv = p.with_suffix('.svg').read_text(encoding='utf-8')
        sv = sv[sv.index('<svg'):]
        w = float(re.search(r'<svg width="([\d.]+)pt"', sv).group(1)); h = float(re.search(r'height="([\d.]+)pt"', sv).group(1))
        sv = re.sub(r'<svg width="[\d.]+pt" height="[\d.]+pt"', f'<svg x="0" y="{y:.2f}" width="{w}" height="{h}"', sv, count=1)
        bloques.append(sv); y += h + gap; ancho = max(ancho, w)
    alto = y - gap
    salida = ('<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
              f'<!-- Generado con Graphviz a partir de BASE DE DATOS/01_esquema_espanol.sql -->\n'
              f'<svg width="{ancho:.0f}pt" height="{alto:.0f}pt" viewBox="0 0 {ancho:.2f} {alto:.2f}" '
              'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n'
              f'<rect width="100%" height="100%" fill="white"/>\n' + '\n'.join(bloques) + '\n</svg>\n')
    destino.with_suffix('.svg').write_text(salida, encoding='utf-8')


def generar(completo):
    nombre = 'der_completo' if completo else 'der_simple'
    texto = 'D&D Textil — Diagrama Entidad-Relación' + ('' if completo else ' (vista general)')
    nodo = nodo_completo if completo else nodo_simple
    tmp = pathlib.Path(tempfile.mkdtemp())
    # 1. encabezado: título a la izquierda, leyenda a la derecha
    cab = ['digraph cab {', BASE.format(extra='rankdir=LR, ranksep=0.3, nodesep=0.12'),
           f'titulo [shape=plain, label={titulo(texto, completo)}];', leyenda(),
           'titulo -> la1 [style=invis, minlen=3];', '}']
    render('\n'.join(cab), tmp / f'{nombre}_1')
    # 2. tablas relacionadas
    g = ['digraph rel {', BASE.format(extra=f'rankdir=LR, nodesep={0.35 if completo else 0.25}, ranksep={1.6 if completo else 1.4}')]
    for t in TABLAS:
        if t in CON_FK:
            g.append(nodo(t))
    for t, c, p in FKS:
        g.append(arista(t, c, p, completo))
    g.append(logica(*LOGICAS[0], completo))
    g.append('}')
    render('\n'.join(g), tmp / f'{nombre}_2')
    # 3. tablas sin llaves foráneas
    h = ['digraph sinfk {', BASE.format(extra=f'rankdir=TB, nodesep=0.5, ranksep={0.45 if not completo else 0.5}'),
         'subgraph cluster_outer { label=<<TABLE BORDER="0" CELLPADDING="1"><TR><TD ALIGN="LEFT"><FONT POINT-SIZE="15"><B>Tablas sin llaves foráneas</B></FONT></TD></TR>'
         '<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="12" COLOR="#555555">Configuración, contenido del inicio, pagos, auditoría y analítica: se consultan por clave, referencia o fecha, no por relaciones</FONT></TD></TR></TABLE>>; '
         'labeljust=l; style="dashed,rounded"; color="#9aa0a8"; margin=18;']
    for i, (m, (d, cl, ts)) in enumerate(MOD.items()):
        sin = [t for t in ts if t in SIN_FK]
        if not sin:
            continue
        h.append(f'subgraph cluster_{i} {{ label=<<FONT COLOR="{d}" POINT-SIZE="13"><B>{E(m)}</B></FONT>>; labeljust=l; '
                 f'style="rounded,filled"; fillcolor="{cl}"; color="{d}"; margin=14;')
        for t in sin:
            h.append(nodo(t))
        for a, b in zip(sin, sin[1:]):
            if (a, b) != ('secciones_inicio', 'diapositivas_carrusel'):
                h.append(f'{a} -> {b} [style=invis];')
        h.append('}')
    h.append('}')
    h.append(logica(*LOGICAS[1], completo))
    h.append('}')
    render('\n'.join(h), tmp / f'{nombre}_3')
    unir([tmp / f'{nombre}_{k}' for k in (1, 2, 3)], OUT / nombre)


generar(False)
generar(True)
